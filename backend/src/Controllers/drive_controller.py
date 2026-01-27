from bson import ObjectId
from flask import jsonify, request
from src.Model.Drive import create_drive, JobType, DriveStatus, RoundStatus
from src.Model.CodingQuestion import create_coding_question
from src.Model.DriveCandidate import initialize_candidate_rounds
from src.Utils.Database import db
from datetime import datetime
from src.Orchestrator.HiringOrchestrator import (
    shortlist_candidates,
    email_candidates,
    schedule_interviews,
    send_final_selection_emails,
    schedule_coding_assessment
)

from src.Tasks.tasks import (
    email_candidates_task, 
    send_final_selection_emails_task, 
    schedule_interviews_task,
    schedule_coding_assessments_task
)


def create_drive_controller():
    print("Create Drive Controller called.")
    data = request.get_json()

    company_id = data.get("company_id")
    role = data.get("role")
    location = data.get("location")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    job_id = data.get("job_id")
    candidates_to_hire = data.get("candidates_to_hire")

    rounds = data.get("rounds", [])
    skills = data.get("skills", [])
    job_type = data.get("job_type", JobType.FULL_TIME)
    internship_duration = data.get("internship_duration")
    coding_questions = data.get("coding_questions", [])

    experience_type = data.get("experience_type")
    experience_min = data.get("experience_min")
    experience_max = data.get("experience_max")

    # Required field validation
    if not company_id:
        return jsonify({"error": "company_id is required"}), 400

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    if not candidates_to_hire:
        return jsonify({"error": "candidates_to_hire is required"}), 400

    try:
        candidates_to_hire = int(candidates_to_hire)
        if candidates_to_hire < 1:
            return jsonify({"error": "candidates_to_hire must be >= 1"}), 400
    except:
        return jsonify({"error": "candidates_to_hire must be integer"}), 400

    # Unique job_id
    if db.drives.find_one({"job_id": job_id}):
        return jsonify({"error": f"job_id '{job_id}' already exists"}), 400

    # Internship validation
    if job_type == "internship" and not internship_duration:
        return jsonify({"error": "internship_duration is required"}), 400

    # Create coding questions
    coding_question_ids = []
    if coding_questions:
        try:
            for q in coding_questions:
                 # Process test cases to ensure 'type' field exists
                raw_test_cases = q.get("testCases", [])
                processed_test_cases = [
                    {
                        "input": tc.get("input"),
                        "output": tc.get("output"),
                        "type": tc.get("type", "public")  # Default to public if not provided
                    }
                    for tc in raw_test_cases
                ]
                cq = create_coding_question(
                    title=q.get("title"),
                    description=q.get("description"),
                    test_cases=q.get("testCases", []),
                    constraints=q.get("constraints", ""),
                    difficulty=q.get("difficulty", "medium"),
                    tags=q.get("tags", []),
                    time_limit=q.get("time_limit"),
                    memory_limit=q.get("memory_limit"),
                    company_id=company_id
                )
                result = db.coding_questions.insert_one(cq)
                coding_question_ids.append(str(result.inserted_id))

        except Exception as e:
            return jsonify({"error": f"Error creating coding questions: {str(e)}"}), 500

    # Create drive
    try:
        drive = create_drive(
            company_id=company_id,
            role=role,
            location=location,
            start_date=start_date,
            end_date=end_date,
            candidates_to_hire=candidates_to_hire,
            job_type=job_type,
            skills=skills,
            rounds=rounds,
            job_id=job_id,
            internship_duration=internship_duration,
            coding_question_ids=coding_question_ids,
            experience_type=experience_type,
            experience_min=experience_min,
            experience_max=experience_max,
            status=DriveStatus.DRIVE_CREATED
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Insert to DB
    result = db.drives.insert_one(drive)
    drive["_id"] = str(result.inserted_id)

    return jsonify({
        "message": "Drive created successfully",
        "drive": drive,
        "coding_questions_count": len(coding_question_ids),
        "rounds_count": len(rounds)
    }), 201



def get_drives_by_company(company_id):
    """
    Get all drives for a specific company with round progress.
    """
    try:
        print(f"Fetching drives for company_id: {company_id}")
        
        # Query using company_id as a STRING
        drives = list(db.drives.find({"company_id": company_id}))
        
        print(f"Found {len(drives)} drives for company {company_id}")
        
        # Convert _id to string and add progress info
        for drive in drives:
            drive["_id"] = str(drive["_id"])
            
            # Add progress information
            current_round = drive.get("current_round", 0)
            total_rounds = len(drive.get("rounds", []))
            
            drive["progress"] = {
                "current_round": current_round,
                "total_rounds": total_rounds,
                "percentage": (current_round / total_rounds * 100) if total_rounds > 0 else 0
            }
        
        return jsonify({"drives": drives}), 200
    except Exception as e:
        print(f"Error in get_drives_by_company: {str(e)}")
        return jsonify({"error": str(e)}), 400


def get_drive_by_id(drive_id):
    """
    Get a single drive by its ID with detailed round information.
    """
    try:
        print(f"Fetching drive with ID: {drive_id}")
        
        # Convert string ID to ObjectId
        try:
            object_id = ObjectId(drive_id)
        except Exception:
            return jsonify({"error": "Invalid drive ID format"}), 400
        
        # Find the drive in database
        drive = db.drives.find_one({"_id": object_id})
        
        if not drive:
            return jsonify({"error": "Drive not found"}), 404
        
        # Convert ObjectId to string for JSON serialization
        drive["_id"] = str(drive["_id"])
        
        # Get candidate statistics for each round
        candidates = list(db.drive_candidates.find({"drive_id": drive_id}))
        
        round_progress = []
        for round_status in drive.get("round_statuses", []):
            round_num = round_status["round_number"]
            
            # Count candidates in each status for this round
            scheduled = sum(
                1 for c in candidates 
                if len(c.get("rounds_status", [])) >= round_num 
                and c["rounds_status"][round_num - 1].get("scheduled") == "yes"
            )
            
            completed = sum(
                1 for c in candidates 
                if len(c.get("rounds_status", [])) >= round_num 
                and c["rounds_status"][round_num - 1].get("completed") == "yes"
            )
            
            passed = sum(
                1 for c in candidates 
                if len(c.get("rounds_status", [])) >= round_num 
                and c["rounds_status"][round_num - 1].get("result") == "passed"
            )
            
            round_progress.append({
                "round_number": round_num,
                "round_type": round_status["round_type"],
                "status": round_status["status"],
                "scheduled_count": scheduled,
                "completed_count": completed,
                "passed_count": passed,
                "total_candidates": len([c for c in candidates if c.get("resume_shortlisted") == "yes"])
            })
        
        drive["round_progress"] = round_progress
        
        print(f"Drive found successfully: {drive.get('job_id', 'No job_id')}")
        
        return jsonify({
            "message": "Drive retrieved successfully",
            "drive": drive
        }), 200
        
    except Exception as e:
        print(f"Error in get_drive_by_id: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def get_all_drives():
    """
    Get all drives with progress information.
    """
    try:
        print("Fetching all drives")
        
        drives = list(db.drives.find())
        
        # Convert ObjectId to string and add progress for each drive
        for drive in drives:
            drive["_id"] = str(drive["_id"])
            
            current_round = drive.get("current_round", 0)
            total_rounds = len(drive.get("rounds", []))
            
            drive["progress"] = {
                "current_round": current_round,
                "total_rounds": total_rounds,
                "percentage": (current_round / total_rounds * 100) if total_rounds > 0 else 0
            }
        
        print(f"Found {len(drives)} drives")
        
        return jsonify({
            "message": f"Retrieved {len(drives)} drives",
            "drives": drives,
            "count": len(drives)
        }), 200
        
    except Exception as e:
        print(f"Error in get_all_drives: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def get_next_round_type(drive_id, current_round_number):
    """
    Get the type of the next round for a drive.
    """
    drive = db.drives.find_one({"_id": ObjectId(drive_id)})
    if not drive:
        return None
    
    rounds = drive.get("rounds", [])
    if current_round_number < len(rounds):
        return rounds[current_round_number].get("type")
    return None


def update_drive_status(drive_id):
    """
    Update drive status with dynamic round handling.
    This version ALSO updates all drive_candidate round statuses
    to match drive.round_statuses.
    """
    try:
        print(f"Updating status for drive ID: {drive_id}")

        try:
            object_id = ObjectId(drive_id)
        except Exception:
            return jsonify({"error": "Invalid drive ID format"}), 400

        data = request.get_json()
        new_status = data.get("status")
        round_number = data.get("round_number")
        round_type = data.get("round_type")

        print("Drive updation controller called with:")
        print("New Status:", new_status)
        print("Round Number:", round_number)
        print("Round Type:", round_type)
        print("-------------------------")


        # Fetch drive document
        drive = db.drives.find_one({"_id": object_id})
        if not drive:
            return jsonify({"error": "Drive not found"}), 404

        job_role = drive.get("role", "")
        keywords = drive.get("skills", [])
        rounds = drive.get("rounds", [])
        current_round = drive.get("current_round", 0)

        # Fetch all drive candidates
        candidates = list(db.drive_candidates.find({"drive_id": drive_id}))


        # ---------------------------------------------------------
        # 📌 1. RESUME SHORTLISTING STEP
        # ---------------------------------------------------------
        if new_status == DriveStatus.RESUME_SHORTLISTED:
            print("Starting resume shortlisting process...")
            shortlist_result = shortlist_candidates(candidates, keywords, job_role)

            shortlisted_candidates = db.drive_candidates.find(
                {"drive_id": drive_id, "resume_shortlisted": "yes"}
            )

            for candidate in shortlisted_candidates:
                rounds_status = initialize_candidate_rounds(rounds)

                db.drive_candidates.update_one(
                    {"_id": candidate["_id"]},
                    {
                        "$set": {"rounds_status": rounds_status}
                    }
                )

            print("✓ Resume shortlisting completed.")



        # ---------------------------------------------------------
        # 📌 2. EMAIL SENT (resume processed)
        # ---------------------------------------------------------
        elif new_status == DriveStatus.EMAIL_SENT:
            print("Queueing email sending task...")

            #................................
            # Using worker
            # task_result = email_candidates_task.delay(drive_id)
            # print(f"Task queued with ID: {task_result.id}")

            # Using without worker
            task_result = email_candidates(drive_id)
            #..........................................
            stages = drive.get("stages", [])
            current_stage = drive.get("currentStage", 0)
            next_stage_index = min(current_stage + 1, len(stages) - 1)

            db.drives.update_one(
                {"_id": object_id},
                {"$set": {"currentStage": next_stage_index, "updated_at": datetime.utcnow()}}
            )



        # ---------------------------------------------------------
        # 📌 3. ROUND SCHEDULING
        # ---------------------------------------------------------
        elif new_status == "ROUND_SCHEDULING":

            if round_number is None:
                round_number = current_round + 1
            
            if round_number > len(rounds):
                return jsonify({"error": "Invalid round number"}), 400
            
            if not round_type:
                round_type = rounds[round_number - 1].get("type")

            print(f"📅 Scheduling round {round_number}: {round_type}")

            # --- Task Selection ---
            if round_type.lower().strip() == "coding":
                print("at coding round controller")
                # using worker
                # task_result = schedule_coding_assessments_task.delay(drive_id)
                # print(f"Coding assessment task queued: {task_result.id}")

                # using without worker
                task_result = schedule_coding_assessment(drive_id, round_type)
                
            else:
                # Using worker 
                # task_result = schedule_interviews_task.delay(drive_id, round_type)
                # print(f"Interview task queued: {task_result.id}")

                # Using without worker
                task_result = schedule_interviews(drive_id,round_type)

            # --- Drive-level update ---
            db.drives.update_one(
                {"_id": object_id, "round_statuses.round_number": round_number},
                {
                    "$set": {
                        "round_statuses.$.status": RoundStatus.IN_PROGRESS,
                        "round_statuses.$.scheduled": "yes",
                        "round_statuses.$.updated_at": datetime.utcnow(),
                        "current_round": round_number,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            # --- 🔥 Candidate-level round update ---
            candidate_round_field = f"rounds_status.{round_number - 1}"

            db.drive_candidates.update_many(
                {"drive_id": drive_id},
                {
                    "$set": {
                        f"{candidate_round_field}.status": RoundStatus.IN_PROGRESS,
                        f"{candidate_round_field}.scheduled": "yes",
                        f"{candidate_round_field}.updated_at": datetime.utcnow()
                    }
                }
            )

            print(f"✓ Updated round {round_number} status for all drive candidates")

            # Stage Increment
            stages = drive.get("stages", [])
            current_stage = drive.get("currentStage", 0)
            next_stage_index = min(current_stage + 1, len(stages) - 1)

            db.drives.update_one(
                {"_id": object_id},
                {"$set": {"currentStage": next_stage_index}}
            )

            return jsonify({
                "message": f"Round {round_number} scheduling initiated",
                "round_number": round_number,
                "round_type": round_type,
                "drive_id": drive_id
            }), 200



        # ---------------------------------------------------------
        # 📌 4. ROUND COMPLETED
        # ---------------------------------------------------------
        elif new_status == "ROUND_COMPLETED":

            if round_number is None:
                return jsonify({"error": "round_number is required"}), 400

            # --- Drive update ---
            db.drives.update_one(
                {"_id": object_id, "round_statuses.round_number": round_number},
                {
                    "$set": {
                        "round_statuses.$.status": RoundStatus.COMPLETED,
                        "round_statuses.$.completed": "yes",
                        "round_statuses.$.updated_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            # --- 🔥 Candidate Update ---
            candidate_round_field = f"rounds_status.{round_number - 1}"

            db.drive_candidates.update_many(
                {"drive_id": drive_id},
                {
                    "$set": {
                        f"{candidate_round_field}.status": RoundStatus.COMPLETED,
                        f"{candidate_round_field}.completed": "yes",
                        f"{candidate_round_field}.updated_at": datetime.utcnow()
                    }
                }
            )

            print(f"✓ Marked round {round_number} as completed for all candidates")

            updated_drive = db.drives.find_one({"_id": object_id})
            all_rounds_completed = all(
                rs.get("status") == RoundStatus.COMPLETED
                for rs in updated_drive.get("round_statuses", [])
            )

            # we will updte this code when we handle multiple rounds.
            # if all_rounds_completed:
            #     print("🎉 All rounds complete! Triggering selection emails.")
            #     task_result = send_final_selection_emails_task.delay(drive_id)

            #     db.drives.update_one(
            #         {"_id": object_id},
            #         {"$set": {"status": DriveStatus.SELECTION_EMAIL_SENT}}
            #     )

            #     return jsonify({
            #         "message": "All rounds completed.",
            #         "drive_id": drive_id
            #     }), 200

            next_round = round_number + 1 if round_number < len(rounds) else None

            return jsonify({
                "message": f"Round {round_number} completed",
                "next_round": next_round,
                "next_round_type": rounds[next_round - 1].get("type") if next_round else None
            }), 200



        # ---------------------------------------------------------
        # 📌 5. FINAL SELECTION EMAILS
        # ---------------------------------------------------------
        elif new_status == DriveStatus.SELECTION_EMAIL_SENT:
            # Using worker
            # print("Queueing final selection emails...")
            # task_result = send_final_selection_emails_task.delay(drive_id)
            
            # Without worker
            task_result = send_final_selection_emails(drive_id)




        # ---------------------------------------------------------
        # 📌 6. GENERIC STATUS UPDATE
        # ---------------------------------------------------------
        if new_status in DriveStatus._value2member_map_:
            stages = drive.get("stages", [])
            current_stage = drive.get("currentStage", 0)

            next_stage_index = min(current_stage + 1, len(stages) - 1)

            result = db.drives.update_one(
                {"_id": object_id},
                {
                    "$set": {
                        "status": new_status,
                        "currentStage": next_stage_index,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            if result.modified_count == 0:
                return jsonify({"error": "Failed to update drive status"}), 500

            return jsonify({
                "message": "Drive status updated successfully",
                "status": new_status,
                "drive_id": drive_id
            }), 200


    except Exception as e:
        print(f"❌ Error in update_drive_status: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500



def get_drive_progress(drive_id):
    """
    Get detailed progress information for a drive including all rounds.
    """
    try:
        object_id = ObjectId(drive_id)
        drive = db.drives.find_one({"_id": object_id})
        
        if not drive:
            return jsonify({"error": "Drive not found"}), 404
        
        # Get candidate statistics for each round
        candidates = list(db.drive_candidates.find({"drive_id": drive_id}))
        total_candidates = len([c for c in candidates if c.get("resume_shortlisted") == "yes"])
        
        round_stats = []
        for round_status in drive.get("round_statuses", []):
            round_num = round_status["round_number"]
            
            # Count candidates in each status for this round
            scheduled = sum(
                1 for c in candidates 
                if len(c.get("rounds_status", [])) >= round_num 
                and c["rounds_status"][round_num - 1].get("scheduled") == "yes"
            )
            
            completed = sum(
                1 for c in candidates 
                if len(c.get("rounds_status", [])) >= round_num 
                and c["rounds_status"][round_num - 1].get("completed") == "yes"
            )
            
            passed = sum(
                1 for c in candidates 
                if len(c.get("rounds_status", [])) >= round_num 
                and c["rounds_status"][round_num - 1].get("result") == "passed"
            )
            
            round_stats.append({
                "round_number": round_num,
                "round_type": round_status["round_type"],
                "status": round_status["status"],
                "scheduled_count": scheduled,
                "completed_count": completed,
                "passed_count": passed,
                "total_candidates": total_candidates,
                "completion_percentage": (completed / total_candidates * 100) if total_candidates > 0 else 0
            })
        
        return jsonify({
            "drive_id": drive_id,
            "job_id": drive.get("job_id"),
            "role": drive.get("role"),
            "current_round": drive.get("current_round", 0),
            "total_rounds": len(drive.get("rounds", [])),
            "overall_status": drive.get("status"),
            "total_candidates": total_candidates,
            "round_details": round_stats
        }), 200
        
    except Exception as e:
        print(f"Error in get_drive_progress: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


from bson import ObjectId
from datetime import datetime

def serialize_mongo_doc(doc):
    """
    Convert MongoDB document to JSON-serializable dict
    """
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc


def get_hr_info(hr_mail):
    print("call for get hr info with email :", hr_mail)

    try:
        print(f"Fetching HR info for email: {hr_mail}")
        user = db.users.find_one({"email": hr_mail})

        if not user:
            print(f"No user found with email: {hr_mail}")
            return None

        user = serialize_mongo_doc(user)

        print(
            f"Found user: {user.get('name', 'Unknown')} "
            f"with company_id: {user.get('company_id', 'None')}"
        )

        return user

    except Exception as e:
        print(f"Error fetching HR info: {str(e)}")
        return None



def get_drive_candidates(drive_id):
    """
    Get all candidates for a specific drive with their round progress.
    """
    try:
        print(f"Fetching candidates for drive_id: {drive_id}")
        
        # Query using drive_id as a STRING
        candidates = list(db.drive_candidates.find({"drive_id": drive_id}))
        
        print(f"Found {len(candidates)} candidates for drive {drive_id}")
        
        # Convert _id to string and add progress info
        for candidate in candidates:
            candidate["_id"] = str(candidate["_id"])
            
            # Calculate current round for candidate
            rounds_status = candidate.get("rounds_status", [])
            current_round = candidate.get("current_round", 0)
            
            # Count completed rounds
            completed_rounds = sum(
                1 for rs in rounds_status if rs.get("completed") == "yes"
            )
            
            candidate["progress"] = {
                "current_round": current_round,
                "completed_rounds": completed_rounds,
                "total_rounds": len(rounds_status)
            }
        
        return jsonify({"candidates": candidates, "count": len(candidates)}), 200
    except Exception as e:
        print(f"Error in get_drive_candidates: {str(e)}")
        return jsonify({"error": str(e)}), 400


def get_drive_candidates_by_job(job_id):
    """
    Find drive by job_id and return all candidates for that drive.
    """
    try:
        if not job_id:
            return jsonify({"error": "job_id is required"}), 400

        print(f"Fetching candidates for job_id: {job_id}")

        drive = db.drives.find_one({"job_id": job_id})
        if not drive:
            return jsonify({"error": "No drive found for this job_id"}), 404

        drive_id = str(drive.get("_id")) if drive and "_id" in drive else None
        if not drive_id:
            return jsonify({"error": "Drive id not found"}), 404

        # Find all drive_candidate records for this drive
        drive_candidates = list(db.drive_candidates.find({"drive_id": drive_id}))

        # Collect unique candidate_ids referenced by drive_candidates
        candidate_ids = []
        for dc in drive_candidates:
            cid = dc.get("candidate_id") or dc.get("candidateId") or dc.get("candidate")
            if cid and cid not in candidate_ids:
                candidate_ids.append(cid)

        # Fetch candidate documents from candidates collection
        result_candidates = []
        for cid in candidate_ids:
            try:
                # Try ObjectId lookup first
                obj_id = ObjectId(cid)
                cand = db.candidates.find_one({"_id": obj_id})
            except Exception:
                # Fallback: try to find by a string id field
                cand = db.candidates.find_one({"_id": cid}) or db.candidates.find_one({"candidate_id": cid})

            if not cand:
                # candidate document not found; skip
                print(f"Candidate document not found for id: {cid}")
                continue

            # Normalize candidate schema: include only candidate fields
            cand_doc = {
                "_id": str(cand.get("_id")),
                "name": cand.get("name"),
                "email": cand.get("email"),
                "resume_content": cand.get("resume_content"),
                "resume_url": cand.get("resume_url"),
                "created_at": cand.get("created_at"),
                "updated_at": cand.get("updated_at")
            }
            result_candidates.append(cand_doc)

        return jsonify({"candidates": result_candidates, "count": len(result_candidates), "drive_id": drive_id}), 200
    except Exception as e:
        print(f"Error in get_drive_candidates_by_job: {str(e)}")
        return jsonify({"error": str(e)}), 400


def remove_application_by_job(job_id, candidate_id):
    """
    Remove (delete) a drive_candidate record for the given job_id and candidate_id.
    This deletes only the drive_candidate document (application), not the candidate document itself.
    """
    try:
        if not job_id or not candidate_id:
            return jsonify({"error": "job_id and candidate_id are required"}), 400

        print(f"Removing application for job_id: {job_id}, candidate_id: {candidate_id}")

        drive = db.drives.find_one({"job_id": job_id})
        if not drive:
            return jsonify({"error": "No drive found for this job_id"}), 404

        drive_id = str(drive.get("_id")) if drive and "_id" in drive else None
        if not drive_id:
            return jsonify({"error": "Drive id not found"}), 404

        # Build deletion query: match drive_id and candidate_id (try ObjectId or string)
        base_query = {"drive_id": drive_id}
        deleted_count = 0

        # Try ObjectId candidate_id match first
        try:
            obj_cid = ObjectId(candidate_id)
            query = {**base_query, "$or": [{"candidate_id": obj_cid}, {"candidate_id": candidate_id}, {"candidateId": candidate_id}]}
            res = db.drive_candidates.delete_one(query)
            deleted_count = res.deleted_count
        except Exception:
            # candidate_id is not a valid ObjectId or ObjectId lookup failed, try string matches
            query = {**base_query, "$or": [{"candidate_id": candidate_id}, {"candidateId": candidate_id}]}
            res = db.drive_candidates.delete_one(query)
            deleted_count = res.deleted_count

        if deleted_count == 0:
            # Second attempt: try to delete by drive_candidate _id
            try:
                obj_dc = ObjectId(candidate_id)
                res2 = db.drive_candidates.delete_one({"_id": obj_dc, "drive_id": drive_id})
                deleted_count = res2.deleted_count
            except Exception:
                pass

        if deleted_count == 0:
            return jsonify({"error": "No application found to delete"}), 404

        print(f"Deleted {deleted_count} drive_candidate records for candidate {candidate_id} in drive {drive_id}")
        return jsonify({"message": "Application removed successfully", "deleted_count": deleted_count}), 200

    except Exception as e:
        print(f"Error in remove_application_by_job: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def get_drive_id_by_job():
    """
    Get drive IDs by job ID.
    """
    job_id = request.args.get("job_id")

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    try:
        print(f"Fetching drive_id for job_id: {job_id}")

        # Query drives matching job_id
        drives = list(db.drives.find({"job_id": job_id}, {"_id": 1}))

        if not drives:
            return jsonify({"message": "No drives found for this job_id"}), 404

        # Extract only drive IDs and convert ObjectId to string
        drive_ids = [str(d["_id"]) for d in drives]

        print(f"Found drive_ids: {drive_ids}")

        return jsonify({"drive_ids": drive_ids}), 200

    except Exception as e:
        print(f"Error in get_drive_id_by_job: {str(e)}")
        return jsonify({"error": str(e)}), 500


def get_shortlisted_candidates_by_job():
    """
    Get shortlisted candidates for a job with their round progress.
    """
    job_id = request.args.get("job_id")
    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    try:
        # Step 1: Find the drive
        drive = db.drives.find_one({"job_id": job_id})
        if not drive:
            return jsonify({"error": "No drive found for this job_id"}), 404

        drive_id = str(drive["_id"])
        print(f"Found drive: {drive_id} for job_id: {job_id}")

        # Step 2: Get shortlisted candidates
        drive_candidates = list(
            db.drive_candidates.find({
                "drive_id": drive_id,
                "resume_shortlisted": {"$in": ["yes", "Yes", True, "true"]}
            })
        )
        print(f"Total shortlisted candidates found: {len(drive_candidates)}")

        if not drive_candidates:
            return jsonify({
                "job_id": job_id,
                "drive_id": drive_id,
                "candidates": []
            }), 200

        # Step 3: Build result with round progress
        result = []
        for cand in drive_candidates:
            rounds_status = cand.get("rounds_status", [])
            current_round = cand.get("current_round", 0)
            
            result.append({
                "candidate_id": cand.get("candidate_id"),
                "resume_shortlisted": cand.get("resume_shortlisted"),
                "selected": cand.get("selected"),
                "current_round": current_round,
                "rounds_completed": sum(1 for rs in rounds_status if rs.get("completed") == "yes"),
                "total_rounds": len(rounds_status),
                "rounds_status": rounds_status,
                "resume_score" : cand.get("resume_score")
            })

        print(f"Total candidates returned: {len(result)}")

        return jsonify({
            "job_id": job_id,
            "drive_id": drive_id,
            "candidates": result,
            "count": len(result)
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


def get_selected_candidates_by_job():
    """
    Get selected candidates for a job (those who were marked selected in drive_candidates).
    Returns full candidate documents for the selected users.
    Expects: ?job_id=<job_id>
    """
    job_id = request.args.get("job_id")
    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    try:
        drive = db.drives.find_one({"job_id": job_id})
        if not drive:
            return jsonify({"error": "No drive found for this job_id"}), 404

        drive_id = str(drive["_id"]) if drive and "_id" in drive else None
        print(f"Fetching selected candidates for drive: {drive_id} (job_id: {job_id})")

        # Find drive_candidates where selected flag is truthy/yes
        drive_candidates = list(db.drive_candidates.find({
            "drive_id": drive_id,
            "selected": {"$in": ["yes", "Yes", True, "true"]}
        }))

        if not drive_candidates:
            return jsonify({"job_id": job_id, "drive_id": drive_id, "candidates": [], "count": 0}), 200

        # Extract unique candidate ids
        candidate_ids = []
        for dc in drive_candidates:
            cid = dc.get("candidate_id") or dc.get("candidateId") or dc.get("candidate")
            if cid and cid not in candidate_ids:
                candidate_ids.append(cid)

        result_candidates = []
        for cid in candidate_ids:
            try:
                obj_id = ObjectId(cid)
                cand = db.candidates.find_one({"_id": obj_id})
            except Exception:
                cand = db.candidates.find_one({"_id": cid}) or db.candidates.find_one({"candidate_id": cid})

            if not cand:
                print(f"Selected candidate document not found for id: {cid}")
                continue

            cand_doc = {
                "_id": str(cand.get("_id")),
                "name": cand.get("name"),
                "email": cand.get("email"),
                "resume_content": cand.get("resume_content"),
                "resume_url": cand.get("resume_url"),
                "created_at": cand.get("created_at"),
                "updated_at": cand.get("updated_at")
            }
            result_candidates.append(cand_doc)

        return jsonify({"job_id": job_id, "drive_id": drive_id, "candidates": result_candidates, "count": len(result_candidates)}), 200

    except Exception as e:
        print(f"Error in get_selected_candidates_by_job: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# Add this to your drive_controller.py
# Helper Logic (The "Model" part of the logic)
def get_active_round_deadline(drive_doc):
    current_round_num = drive_doc.get("current_round")
    if not current_round_num:
        return None
    
    # Look into round_statuses for the deadline
    round_statuses = drive_doc.get("round_statuses", [])
    active_round = next(
        (rs for rs in round_statuses if rs.get("round_number") == current_round_num), 
        None
    )
    return active_round.get("deadline") if active_round else None

# --- Existing Controllers ---

def get_deadline_controller():
    drive_id = request.args.get("drive_id")
    if not drive_id:
        return jsonify({"error": "drive_id is required"}), 400
    try:
        drive = db.drives.find_one({"_id": ObjectId(drive_id)})
        if not drive:
            return jsonify({"error": "Drive not found"}), 404

        deadline = get_active_round_deadline(drive)
        return jsonify({
            "drive_id": drive_id,
            "current_round": drive.get("current_round"),
            "deadline": deadline,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
def update_round_deadlines(drive_id):
    """
    Updates the deadline for specific rounds in a drive and syncs to candidates.
    """
    try:
        data = request.get_json()
        deadlines_to_update = data.get("deadlines", [])

        if not deadlines_to_update:
            return jsonify({"error": "No deadline data provided"}), 400

        # Validate ObjectId
        try:
            object_id = ObjectId(drive_id)
        except Exception:
            return jsonify({"error": "Invalid drive ID format"}), 400

        # This loop must be OUTSIDE the except block and INSIDE the main try
        for item in deadlines_to_update:
            round_num = item.get("round_number")
            new_deadline = item.get("deadline") 

            # All database updates must be indented INSIDE the for loop
            # 1. Update round config
            db.drives.update_one(
                {"_id": object_id, "rounds.number": round_num},
                {"$set": {"rounds.$.deadline": new_deadline}}
            )
            
            # 2. Update tracking status
            db.drives.update_one(
                {"_id": object_id, "round_statuses.round_number": round_num},
                {"$set": {"round_statuses.$.deadline": new_deadline}}
            )

            # 3. Update all candidates
            candidate_round_field = f"rounds_status.{round_num - 1}.deadline"
            db.drive_candidates.update_many(
                {"drive_id": drive_id},
                {"$set": {candidate_round_field: new_deadline}}
            )

        return jsonify({"message": "Deadlines updated successfully"}), 200

    except Exception as e:
        # This handles errors for the outer try block
        print(f"❌ Error in update_round_deadlines: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500