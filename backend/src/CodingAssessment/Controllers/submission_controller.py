from bson import ObjectId
from flask import jsonify, request
from src.Model.Submission import (
    create_submission,
    create_question_submission,
    update_submission_status,
    update_question_submission_result,
    calculate_submission_statistics,
    validate_submission_data,
    format_submission_response,
    get_language_id,
    determine_submission_result,
    SubmissionStatus,
    SubmissionResult,
    ProgrammingLanguage
)
from src.Utils.Database import db
from datetime import datetime
from src.CodingAssessment.Utils.judge0_client import submit_and_wait


def create_submission_controller():
    """
    Create a new submission for a code assessment.
    This should be called when user clicks "Submit Assessment" button.
    """
    try:
        data = request.get_json()
        
        candidate_id = data.get("candidate_id")
        drive_id = data.get("drive_id")
        
        # Validation
        if not candidate_id:
            return jsonify({"error": "candidate_id is required"}), 400
        
        if not drive_id:
            return jsonify({"error": "drive_id is required"}), 400
        
        # Get drive details
        drive = db.drives.find_one({"_id": ObjectId(drive_id)})
        if not drive:
            return jsonify({"error": "Drive not found"}), 404
        
        # Get coding question IDs from drive
        coding_question_ids = drive.get("coding_question_ids", [])
        total_questions = len(coding_question_ids)
        
        if total_questions == 0:
            return jsonify({"error": "No coding questions found for this drive"}), 400
        
        # Check if submission already exists for this candidate and drive
        existing_submission = db.submissions.find_one({
            "candidate_id": candidate_id,
            "drive_id": drive_id
        })
        
        if existing_submission:
            return jsonify({
                "message": "Submission already exists",
                "submission": format_submission_response(existing_submission)
            }), 200
        
        # Create submission
        submission = create_submission(
            candidate_id=candidate_id,
            drive_id=drive_id,
            code_assessment_id=drive_id,  # Using drive_id as code_assessment_id
            total_questions=total_questions
        )
        
        # Validate submission data
        is_valid, error_msg = validate_submission_data(submission)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        # Insert into database
        result = db.submissions.insert_one(submission)
        submission["_id"] = str(result.inserted_id)
        
        print(f"Submission created successfully: {submission['_id']}")
        
        return jsonify({
            "message": "Submission created successfully",
            "submission": format_submission_response(submission)
        }), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error in create_submission_controller: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def submit_question_controller():
    """
    Submit a single question for evaluation.
    This is called when user clicks "Run Code" button.
    Creates submission if it doesn't exist.
    """
    try:
        data = request.get_json()
        
        candidate_id = data.get("candidate_id")
        drive_id = data.get("drive_id")
        question_id = data.get("question_id")
        source_code = data.get("source_code")
        language = data.get("language")
        time_taken = data.get("time_taken", 0)
        
        # Validation
        if not candidate_id:
            return jsonify({"error": "candidate_id is required"}), 400
        
        if not drive_id:
            return jsonify({"error": "drive_id is required"}), 400
        
        if not question_id:
            return jsonify({"error": "question_id is required"}), 400
        
        if not source_code:
            return jsonify({"error": "source_code is required"}), 400
        
        if not language:
            return jsonify({"error": "language is required"}), 400
        
        # Check if submission exists, create if not
        submission = db.submissions.find_one({
            "candidate_id": candidate_id,
            "drive_id": drive_id
        })
        
        if not submission:
            # Create submission automatically
            drive = db.drives.find_one({"_id": ObjectId(drive_id)})
            if not drive:
                return jsonify({"error": "Drive not found"}), 404
            
            coding_question_ids = drive.get("coding_question_ids", [])
            total_questions = len(coding_question_ids)
            
            submission_data = create_submission(
                candidate_id=candidate_id,
                drive_id=drive_id,
                code_assessment_id=drive_id,
                total_questions=total_questions
            )
            
            result = db.submissions.insert_one(submission_data)
            submission = db.submissions.find_one({"_id": result.inserted_id})
            print(f"Auto-created submission: {result.inserted_id}")
        
        submission_id = str(submission["_id"])
        
        # Get coding question details
        coding_question = db.coding_questions.find_one({"_id": ObjectId(question_id)})
        if not coding_question:
            return jsonify({"error": "Coding question not found"}), 404
        
        # IMPORTANT: Get test cases and log them
        test_cases = coding_question.get("test_cases", [])
        total_test_cases = len(test_cases)
        
        print(f"\n=== Question Details ===")
        print(f"Question ID: {question_id}")
        print(f"Title: {coding_question.get('title')}")
        print(f"Test Cases Retrieved: {total_test_cases}")
        for idx, tc in enumerate(test_cases):
            print(f"  Test Case {idx + 1}:")
            print(f"    Input: '{tc.get('input')}'")
            print(f"    Output: '{tc.get('output')}'")
        
        if total_test_cases == 0:
            return jsonify({"error": "No test cases found for this question"}), 400
        
        # Get language ID for Judge0
        try:
            language_id = get_language_id(language)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        
        # Check if question already submitted
        existing_question_index = None
        for idx, qs in enumerate(submission.get("question_submissions", [])):
            if qs.get("question_id") == question_id:
                existing_question_index = idx
                break
        
        # Determine question number
        if existing_question_index is not None:
            question_number = existing_question_index + 1
        else:
            question_number = len(submission.get("question_submissions", [])) + 1
        
        # Create question submission
        question_sub = create_question_submission(
            question_id=question_id,
            question_number=question_number,
            source_code=source_code,
            language=language,
            total_test_cases=total_test_cases,
            time_taken=time_taken
        )
        
        if existing_question_index is not None:
            # Update existing submission
            db.submissions.update_one(
                {"_id": ObjectId(submission_id), "question_submissions.question_id": question_id},
                {"$set": {
                    "question_submissions.$.source_code": source_code,
                    "question_submissions.$.language": language,
                    "question_submissions.$.time_taken": time_taken,
                    "question_submissions.$.status": SubmissionStatus.PENDING,
                    "question_submissions.$.updated_at": datetime.utcnow()
                }}
            )
        else:
            # Add new question submission
            db.submissions.update_one(
                {"_id": ObjectId(submission_id)},
                {"$push": {"question_submissions": question_sub}}
            )
        
        # Run the submission with proper test cases
        result = run_submission(
            code=source_code,
            language_id=language_id,
            submission_id=submission_id,
            question_id=question_id,
            test_cases=test_cases  # Pass test cases here
        )
        
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error in submit_question_controller: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    
    
def run_submission(code, language_id, submission_id, question_id, test_cases):
    """
    Run code submission against test cases and update database.
    Includes security masking for private test cases.
    """
    try:
        # 1. Mark the specific question as RUNNING in the database
        db.submissions.update_one(
            {"_id": ObjectId(submission_id), "question_submissions.question_id": question_id},
            {"$set": {
                "question_submissions.$.status": SubmissionStatus.RUNNING,
                "question_submissions.$.updated_at": datetime.utcnow()
            }}
        )
        
        results = []
        test_cases_passed = 0
        total_test_cases = len(test_cases)
        total_execution_time = 0
        max_memory_used = 0
        error_messages = []
        
        # 2. Iterate through test cases
        for idx, tc in enumerate(test_cases):
            # Normalize keys (handles variations in DB schema)
            tc_input = tc.get("input") or tc.get("stdin") or ""
            expected_output = tc.get("output") or tc.get("expected_output") or tc.get("stdout") or ""
            is_private = tc.get("type") == "private"
            
            # Ensure values are strings and stripped of trailing whitespace
            tc_input = str(tc_input)
            expected_output = str(expected_output).strip()

            # Logic check: If no expected output, we can't grade it
            if not expected_output:
                res_obj = {
                    "test_case_number": idx + 1,
                    "status": {"id": -1, "description": "Invalid Test Case"},
                    "result": SubmissionResult.ERROR,
                    "type": tc.get("type", "public")
                }
                results.append(res_obj)
                continue

            try:
                # 3. Submit to Judge0
                judge0_response = submit_and_wait(
                    source_code=code,
                    language_id=language_id,
                    stdin=tc_input
                )
                
                # Extract results from Judge0 response
                actual_output = str(judge0_response.get("stdout") or "").strip()
                judge0_status = judge0_response.get("status", {})
                
                # 4. Determine if the test case passed
                # This function handles status checking and string comparison
                result_status = determine_submission_result(
                    judge0_status,
                    expected_output,
                    actual_output
                )
                
                if result_status == SubmissionResult.ACCEPTED:
                    test_cases_passed += 1
                
                # Track metrics
                exec_time = float(judge0_response.get("time") or 0) * 1000 # to ms
                memory = float(judge0_response.get("memory") or 0) / 1024  # to MB
                total_execution_time += exec_time
                max_memory_used = max(max_memory_used, memory)

                # Collect errors for the DB log
                if judge0_response.get("stderr"):
                    error_messages.append(f"TC {idx+1} Error: {judge0_response.get('stderr')}")

                # 5. SECURITY MASKING: Mask data before sending to the frontend
                # We store the real data in 'res_obj' for the DB, but mask it for the 'sanitized' list
                res_obj = {
                    "test_case_number": idx + 1,
                    "status": judge0_status,
                    "stdin": "[Hidden]" if is_private else tc_input,
                    "expected": "[Hidden]" if is_private else expected_output,
                    "stdout": "[Hidden]" if is_private else actual_output,
                    "stderr": "[Hidden]" if (is_private and judge0_response.get("stderr")) else judge0_response.get("stderr"),
                    "time": judge0_response.get("time"),
                    "memory": judge0_response.get("memory"),
                    "result": result_status,
                    "type": tc.get("type", "public")
                }
                results.append(res_obj)
                
            except Exception as e:
                results.append({
                    "test_case_number": idx + 1,
                    "status": {"id": -1, "description": "Execution Error"},
                    "stderr": str(e),
                    "result": SubmissionResult.ERROR,
                    "type": tc.get("type", "public")
                })

        # 6. Determine overall result for this question
        if test_cases_passed == total_test_cases:
            overall_result = SubmissionResult.ACCEPTED
        elif test_cases_passed > 0:
            overall_result = SubmissionResult.WRONG_ANSWER
        else:
            # If no cases passed, use the result of the first failing case
            overall_result = results[0].get("result") if results else SubmissionResult.ERROR

        # 7. Update database with results and metrics
        update_fields = update_question_submission_result(
            status=SubmissionStatus.COMPLETED,
            result=overall_result,
            test_cases_passed=test_cases_passed,
            total_test_cases=total_test_cases,
            execution_time=int(total_execution_time),
            memory_used=round(max_memory_used, 2),
            error_message="\n".join(error_messages) if error_messages else None
        )
        
        # We also want to store the results (masked or full) in the DB for later review
        update_fields["question_submissions.$.test_case_results"] = results
        
        db.submissions.update_one(
            {"_id": ObjectId(submission_id), "question_submissions.question_id": question_id},
            {"$set": update_fields}
        )
        
        # 8. Trigger overall submission stats update (total score, total time)
        update_overall_submission(submission_id)
        
        return {
            "success": True,
            "result": overall_result,
            "test_cases_passed": test_cases_passed,
            "total_test_cases": total_test_cases,
            "results": results # This array is now sanitized/masked
        }
        
    except Exception as e:
        error_message = str(e)
        import traceback
        traceback.print_exc()
        
        # Fallback: Mark question as error in database
        db.submissions.update_one(
            {"_id": ObjectId(submission_id), "question_submissions.question_id": question_id},
            {"$set": {
                "question_submissions.$.status": SubmissionStatus.ERROR,
                "question_submissions.$.result": SubmissionResult.ERROR,
                "question_submissions.$.error_message": error_message,
                "question_submissions.$.updated_at": datetime.utcnow()
            }}
        )
        
        return {
            "success": False,
            "error": error_message,
            "test_cases_passed": 0,
            "total_test_cases": len(test_cases) if test_cases else 0,
            "results": []
        }
    
def update_overall_submission(submission_id):
    """
    Update overall submission statistics based on question submissions.
    """
    try:
        submission = db.submissions.find_one({"_id": ObjectId(submission_id)})
        if not submission:
            return
        
        question_submissions = submission.get("question_submissions", [])
        
        # Calculate statistics
        stats = calculate_submission_statistics(question_submissions)
        
        # Update total time taken (sum of all question time_taken)
        total_time = sum(qs.get("time_taken", 0) for qs in question_submissions)
        
        # Update submission (don't change status to COMPLETED automatically)
        db.submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {
                "questions_solved": stats["questions_solved"],
                "score_percentage": stats["score_percentage"],
                "total_time_taken": total_time,
                "updated_at": datetime.utcnow()
            }}
        )
        
        print(f"Updated submission {submission_id}: {stats['questions_solved']}/{stats['total_questions']} solved ({stats['score_percentage']}%)")
        
    except Exception as e:
        print(f"Error updating overall submission: {str(e)}")


def final_submit_controller():
    """
    Mark assessment as complete when user clicks "Submit Assessment".
    Creates submission if it doesn't exist.
    """
    try:
        data = request.get_json()
        
        candidate_id = data.get("candidate_id")
        drive_id = data.get("drive_id")
        
        if not candidate_id:
            return jsonify({"error": "candidate_id is required"}), 400
        
        if not drive_id:
            return jsonify({"error": "drive_id is required"}), 400
        
        # Check if submission exists
        submission = db.submissions.find_one({
            "candidate_id": candidate_id,
            "drive_id": drive_id
        })
        
        if not submission:
            # Create submission if it doesn't exist
            drive = db.drives.find_one({"_id": ObjectId(drive_id)})
            if not drive:
                return jsonify({"error": "Drive not found"}), 404
            
            coding_question_ids = drive.get("coding_question_ids", [])
            total_questions = len(coding_question_ids)
            
            submission_data = create_submission(
                candidate_id=candidate_id,
                drive_id=drive_id,
                code_assessment_id=drive_id,
                total_questions=total_questions
            )
            
            result = db.submissions.insert_one(submission_data)
            submission = db.submissions.find_one({"_id": result.inserted_id})
        
        submission_id = str(submission["_id"])
        
        # Mark as completed and submitted
        db.submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {
                "status": SubmissionStatus.COMPLETED,
                "submitted_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Get updated statistics
        return get_submission_statistics(submission_id)
        
    except Exception as e:
        print(f"Error in final_submit_controller: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def get_submission_by_id(submission_id):
    """
    Get submission by ID.
    """
    try:
        submission = db.submissions.find_one({"_id": ObjectId(submission_id)})
        
        if not submission:
            return jsonify({"error": "Submission not found"}), 404
        
        return jsonify({
            "message": "Submission retrieved successfully",
            "submission": format_submission_response(submission)
        }), 200
        
    except Exception as e:
        print(f"Error in get_submission_by_id: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def get_submissions_by_candidate(candidate_id):
    """
    Get all submissions for a candidate.
    """
    try:
        submissions = list(db.submissions.find({"candidate_id": candidate_id}))
        
        formatted_submissions = [format_submission_response(sub) for sub in submissions]
        
        return jsonify({
            "message": f"Retrieved {len(submissions)} submissions",
            "submissions": formatted_submissions,
            "count": len(submissions)
        }), 200
        
    except Exception as e:
        print(f"Error in get_submissions_by_candidate: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def get_submissions_by_drive(drive_id):
    """
    Get all submissions for a drive.
    """
    try:
        submissions = list(db.submissions.find({"drive_id": drive_id}))
        
        formatted_submissions = [format_submission_response(sub) for sub in submissions]
        
        return jsonify({
            "message": f"Retrieved {len(submissions)} submissions",
            "submissions": formatted_submissions,
            "count": len(submissions)
        }), 200
        
    except Exception as e:
        print(f"Error in get_submissions_by_drive: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def get_submission_statistics(submission_id):
    """
    Get detailed statistics for a submission.
    """
    try:
        submission = db.submissions.find_one({"_id": ObjectId(submission_id)})
        
        if not submission:
            return jsonify({"error": "Submission not found"}), 404
        
        question_submissions = submission.get("question_submissions", [])
        stats = calculate_submission_statistics(question_submissions)
        
        # Add additional statistics
        stats["candidate_id"] = submission.get("candidate_id")
        stats["drive_id"] = submission.get("drive_id")
        stats["status"] = submission.get("status")
        stats["started_at"] = submission.get("started_at").isoformat() if submission.get("started_at") else None
        stats["submitted_at"] = submission.get("submitted_at").isoformat() if submission.get("submitted_at") else None
        stats["problems_attempted"] = len(question_submissions)
        stats["total_questions"] = submission.get("total_questions", 0)
        # Question-wise breakdown
        question_breakdown = []
        for qs in question_submissions:
            question_breakdown.append({
                "question_number": qs.get("question_number"),
                "question_id": qs.get("question_id"),
                "result": qs.get("result"),
                "test_cases_passed": qs.get("test_cases_passed"),
                "total_test_cases": qs.get("total_test_cases"),
                "time_taken": qs.get("time_taken"),
                "execution_time": qs.get("execution_time"),
                "memory_used": qs.get("memory_used")
            })
        
        stats["question_breakdown"] = question_breakdown
        
        return jsonify({
            "message": "Statistics retrieved successfully",
            "statistics": stats
        }), 200
        
    except Exception as e:
        print(f"Error in get_submission_statistics: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 



        


# try:
#             submission = db.submissions.find_one({"_id": ObjectId(submission_id)})
#             if not submission:
#                 return jsonify({"error": "Submission not found"}), 404
        
#             question_submissions = submission.get("question_submissions", [])
#             stats = calculate_submission_statistics(question_submissions)
        
#             # Explicitly calculate "Attempted" count
#             # A question is attempted if it exists in the question_submissions array
#             stats["problems_attempted"] = len(question_submissions)
        
#             # Ensure total_questions from the drive is included
#             stats["total_questions"] = submission.get("total_questions", 0)