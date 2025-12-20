# controllers/feedback_controller.py
from src.Utils.Database import db
from flask import jsonify, make_response
from datetime import datetime, timedelta
from bson import ObjectId
import csv
import io



class FeedbackController:
    """
    Controller for handling interview feedback operations
    """
    
    def __init__(self):
        # Initialize database connection
        # Replace this with your actual database initialization
        from src.Utils.Database import db
        self.db = db
        self.feedback_collection = db.interview_feedback
        self.candidates_collection = db.drive_candidates
    
    
    def validate_feedback_data(self, data):
        """
        Validate feedback submission data
        
        Args:
            data: Dictionary containing feedback data
            
        Returns:
            tuple: (is_valid, error_message)
        """
        # Required fields
        required_fields = [
            'drive_candidate_id',
            'interview_type',
            'candidate_email',
            'candidate_name',
            'overall_experience',
            'interview_difficulty',
            'technical_relevance',
            'interviewer_behavior',
            'platform_usability',
            'would_recommend',
            'improvements'
        ]
        
        # Check for missing required fields
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                return False, f'Missing required field: {field}'
        
        # Validate rating fields (1-5)
        rating_fields = [
            'overall_experience',
            'technical_relevance',
            'interviewer_behavior',
            'platform_usability'
        ]
        
        for field in rating_fields:
            try:
                value = int(data[field])
                if value < 1 or value > 5:
                    return False, f'{field} must be between 1 and 5'
            except (ValueError, TypeError):
                return False, f'{field} must be an integer'
        
        # Validate interview_difficulty (1-5)
        try:
            difficulty = int(data['interview_difficulty'])
            if difficulty < 1 or difficulty > 5:
                return False, 'interview_difficulty must be between 1 and 5'
        except (ValueError, TypeError):
            return False, 'interview_difficulty must be an integer'
        
        # Validate would_recommend
        if data['would_recommend'] not in ['yes', 'maybe', 'no']:
            return False, 'would_recommend must be "yes", "maybe", or "no"'
        
        # Validate email format (basic)
        email = data['candidate_email']
        if '@' not in email or '.' not in email:
            return False, 'Invalid email format'
        
        return True, None
    
    
    def submit_feedback(self, data):
        """
        Submit candidate feedback
        
        Args:
            data: Dictionary containing feedback data
            
        Returns:
            Flask response with status code
        """
        # Validate data
        is_valid, error_message = self.validate_feedback_data(data)
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        try:
            # Create feedback document
            feedback_document = {
                'drive_candidate_id': data['drive_candidate_id'],
                'interview_type': data['interview_type'],
                'candidate_email': data['candidate_email'],
                'candidate_name': data['candidate_name'],
                'ratings': {
                    'overall_experience': int(data['overall_experience']),
                    'interview_difficulty': int(data['interview_difficulty']),
                    'technical_relevance': int(data['technical_relevance']),
                    'interviewer_behavior': int(data['interviewer_behavior']),
                    'platform_usability': int(data['platform_usability'])
                },
                'would_recommend': data['would_recommend'],
                'improvements': data['improvements'],
                'additional_comments': data.get('additional_comments', ''),
                'submitted_at': datetime.utcnow(),
                'created_at': datetime.utcnow()
            }
            
            # Insert into database
            result = self.feedback_collection.insert_one(feedback_document)
            
            # Update drive_candidate record to mark feedback as received
            try:
                self.candidates_collection.update_one(
                    {'_id': ObjectId(data['drive_candidate_id'])},
                    {
                        '$set': {
                            'feedback_received': True,
                            'feedback_received_at': datetime.utcnow()
                        }
                    }
                )
            except Exception as e:
                print(f"Warning: Could not update candidate record: {str(e)}")
            
            return jsonify({
                'success': True,
                'message': 'Feedback submitted successfully',
                'feedback_id': str(result.inserted_id)
            }), 201
            
        except Exception as e:
            print(f"Error in submit_feedback: {str(e)}")
            return jsonify({
                'error': 'Failed to submit feedback',
                'message': str(e)
            }), 500
    
    
    def get_feedback_by_candidate(self, drive_candidate_id):
        """
        Get feedback for a specific candidate
        
        Args:
            drive_candidate_id: ID of the drive candidate
            
        Returns:
            Flask response with feedback data
        """
        try:
            feedback = self.feedback_collection.find_one({
                'drive_candidate_id': drive_candidate_id
            })
            
            if not feedback:
                return jsonify({
                    'error': 'Feedback not found'
                }), 404
            
            # Convert ObjectId to string
            feedback['_id'] = str(feedback['_id'])
            
            # Convert datetime to ISO format
            if 'submitted_at' in feedback:
                feedback['submitted_at'] = feedback['submitted_at'].isoformat()
            if 'created_at' in feedback:
                feedback['created_at'] = feedback['created_at'].isoformat()
            
            return jsonify(feedback), 200
            
        except Exception as e:
            print(f"Error in get_feedback_by_candidate: {str(e)}")
            return jsonify({
                'error': 'Failed to retrieve feedback',
                'message': str(e)
            }), 500
    
    
    def get_feedback_analytics(self, interview_type=None):
        """
        Get aggregated feedback analytics
        
        Args:
            interview_type: Optional filter by interview type
            
        Returns:
            Flask response with analytics data
        """
        try:
            # Build match query
            match_query = {}
            if interview_type:
                match_query['interview_type'] = interview_type
            
            # Aggregate feedback data
            pipeline = [
                {'$match': match_query},
                {
                    '$group': {
                        '_id': None,
                        'total_responses': {'$sum': 1},
                        'avg_overall_experience': {'$avg': '$ratings.overall_experience'},
                        'avg_interview_difficulty': {'$avg': '$ratings.interview_difficulty'},
                        'avg_technical_relevance': {'$avg': '$ratings.technical_relevance'},
                        'avg_interviewer_behavior': {'$avg': '$ratings.interviewer_behavior'},
                        'avg_platform_usability': {'$avg': '$ratings.platform_usability'},
                        'would_recommend_yes': {
                            '$sum': {
                                '$cond': [{'$eq': ['$would_recommend', 'yes']}, 1, 0]
                            }
                        },
                        'would_recommend_maybe': {
                            '$sum': {
                                '$cond': [{'$eq': ['$would_recommend', 'maybe']}, 1, 0]
                            }
                        },
                        'would_recommend_no': {
                            '$sum': {
                                '$cond': [{'$eq': ['$would_recommend', 'no']}, 1, 0]
                            }
                        }
                    }
                }
            ]
            
            result = list(self.feedback_collection.aggregate(pipeline))
            
            if not result:
                return jsonify({
                    'total_responses': 0,
                    'averages': {},
                    'recommendations': {}
                }), 200
            
            analytics = result[0]
            analytics.pop('_id', None)
            
            # Calculate recommendation percentage
            total = analytics['total_responses']
            if total > 0:
                analytics['recommendation_percentage'] = {
                    'yes': round((analytics['would_recommend_yes'] / total) * 100, 2),
                    'maybe': round((analytics['would_recommend_maybe'] / total) * 100, 2),
                    'no': round((analytics['would_recommend_no'] / total) * 100, 2)
                }
            
            return jsonify(analytics), 200
            
        except Exception as e:
            print(f"Error in get_feedback_analytics: {str(e)}")
            return jsonify({
                'error': 'Failed to retrieve analytics',
                'message': str(e)
            }), 500
    
    
    def get_all_feedback(self, page=1, limit=10, interview_type=None, sort_by='submitted_at', sort_order='desc'):
        """
        Get all feedback with pagination and filtering
        
        Args:
            page: Page number
            limit: Items per page
            interview_type: Optional filter by interview type
            sort_by: Field to sort by
            sort_order: Sort order (asc or desc)
            
        Returns:
            Flask response with feedback list
        """
        try:
            # Build query
            query = {}
            if interview_type:
                query['interview_type'] = interview_type
            
            # Calculate skip
            skip = (page - 1) * limit
            
            # Determine sort direction
            sort_direction = -1 if sort_order == 'desc' else 1
            
            # Get total count
            total_count = self.feedback_collection.count_documents(query)
            
            # Get feedback with pagination
            feedback_list = list(
                self.feedback_collection
                .find(query)
                .sort(sort_by, sort_direction)
                .skip(skip)
                .limit(limit)
            )
            
            # Convert ObjectId and datetime to strings
            for feedback in feedback_list:
                feedback['_id'] = str(feedback['_id'])
                if 'submitted_at' in feedback:
                    feedback['submitted_at'] = feedback['submitted_at'].isoformat()
                if 'created_at' in feedback:
                    feedback['created_at'] = feedback['created_at'].isoformat()
            
            # Calculate pagination info
            total_pages = (total_count + limit - 1) // limit
            
            return jsonify({
                'feedback': feedback_list,
                'pagination': {
                    'current_page': page,
                    'total_pages': total_pages,
                    'total_items': total_count,
                    'items_per_page': limit,
                    'has_next': page < total_pages,
                    'has_prev': page > 1
                }
            }), 200
            
        except Exception as e:
            print(f"Error in get_all_feedback: {str(e)}")
            return jsonify({
                'error': 'Failed to retrieve feedback',
                'message': str(e)
            }), 500
    
    
    def get_feedback_stats(self, days=30):
        """
        Get feedback statistics for the last N days
        
        Args:
            days: Number of days to include
            
        Returns:
            Flask response with statistics
        """
        try:
            # Calculate date threshold
            date_threshold = datetime.utcnow() - timedelta(days=days)
            
            # Get feedback trend over time
            pipeline = [
                {
                    '$match': {
                        'submitted_at': {'$gte': date_threshold}
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'year': {'$year': '$submitted_at'},
                            'month': {'$month': '$submitted_at'},
                            'day': {'$dayOfMonth': '$submitted_at'}
                        },
                        'count': {'$sum': 1},
                        'avg_overall': {'$avg': '$ratings.overall_experience'},
                        'avg_difficulty': {'$avg': '$ratings.interview_difficulty'}
                    }
                },
                {
                    '$sort': {'_id.year': 1, '_id.month': 1, '_id.day': 1}
                }
            ]
            
            trend_data = list(self.feedback_collection.aggregate(pipeline))
            
            # Format trend data
            formatted_trend = []
            for item in trend_data:
                formatted_trend.append({
                    'date': f"{item['_id']['year']}-{item['_id']['month']:02d}-{item['_id']['day']:02d}",
                    'count': item['count'],
                    'avg_overall': round(item['avg_overall'], 2),
                    'avg_difficulty': round(item['avg_difficulty'], 2)
                })
            
            # Get overall stats for the period
            overall_stats_pipeline = [
                {
                    '$match': {
                        'submitted_at': {'$gte': date_threshold}
                    }
                },
                {
                    '$group': {
                        '_id': None,
                        'total': {'$sum': 1},
                        'avg_overall': {'$avg': '$ratings.overall_experience'},
                        'avg_difficulty': {'$avg': '$ratings.interview_difficulty'},
                        'avg_relevance': {'$avg': '$ratings.technical_relevance'},
                        'avg_behavior': {'$avg': '$ratings.interviewer_behavior'},
                        'avg_usability': {'$avg': '$ratings.platform_usability'}
                    }
                }
            ]
            
            overall_result = list(self.feedback_collection.aggregate(overall_stats_pipeline))
            overall_stats = overall_result[0] if overall_result else {}
            
            if overall_stats:
                overall_stats.pop('_id', None)
                # Round averages
                for key in overall_stats:
                    if key.startswith('avg_'):
                        overall_stats[key] = round(overall_stats[key], 2)
            
            return jsonify({
                'period_days': days,
                'trend': formatted_trend,
                'overall_stats': overall_stats
            }), 200
            
        except Exception as e:
            print(f"Error in get_feedback_stats: {str(e)}")
            return jsonify({
                'error': 'Failed to retrieve statistics',
                'message': str(e)
            }), 500
    
    
    def export_feedback_to_csv(self, interview_type=None, start_date=None, end_date=None):
        """
        Export feedback data to CSV
        
        Args:
            interview_type: Optional filter by interview type
            start_date: Optional start date (YYYY-MM-DD)
            end_date: Optional end date (YYYY-MM-DD)
            
        Returns:
            Flask response with CSV file
        """
        try:
            # Build query
            query = {}
            if interview_type:
                query['interview_type'] = interview_type
            
            # Add date range filter
            if start_date or end_date:
                query['submitted_at'] = {}
                if start_date:
                    query['submitted_at']['$gte'] = datetime.strptime(start_date, '%Y-%m-%d')
                if end_date:
                    query['submitted_at']['$lte'] = datetime.strptime(end_date, '%Y-%m-%d')
            
            # Get feedback data
            feedback_list = list(self.feedback_collection.find(query))
            
            # Create CSV in memory
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                'Feedback ID',
                'Drive Candidate ID',
                'Interview Type',
                'Candidate Name',
                'Candidate Email',
                'Overall Experience',
                'Interview Difficulty',
                'Technical Relevance',
                'Interviewer Behavior',
                'Platform Usability',
                'Would Recommend',
                'Improvements',
                'Additional Comments',
                'Submitted At'
            ])
            
            # Write data
            for feedback in feedback_list:
                writer.writerow([
                    str(feedback['_id']),
                    feedback['drive_candidate_id'],
                    feedback['interview_type'],
                    feedback['candidate_name'],
                    feedback['candidate_email'],
                    feedback['ratings']['overall_experience'],
                    feedback['ratings']['interview_difficulty'],
                    feedback['ratings']['technical_relevance'],
                    feedback['ratings']['interviewer_behavior'],
                    feedback['ratings']['platform_usability'],
                    feedback['would_recommend'],
                    feedback['improvements'],
                    feedback.get('additional_comments', ''),
                    feedback['submitted_at'].isoformat()
                ])
            
            # Create response
            output.seek(0)
            response = make_response(output.getvalue())
            response.headers['Content-Type'] = 'text/csv'
            response.headers['Content-Disposition'] = 'attachment; filename=feedback_export.csv'
            
            return response
            
        except Exception as e:
            print(f"Error in export_feedback_to_csv: {str(e)}")
            return jsonify({
                'error': 'Failed to export feedback',
                'message': str(e)
            }), 500
    
    
    def delete_feedback(self, feedback_id):
        """
        Delete a feedback entry
        
        Args:
            feedback_id: ID of the feedback to delete
            
        Returns:
            Flask response
        """
        try:
            # Validate ObjectId
            try:
                obj_id = ObjectId(feedback_id)
            except:
                return jsonify({
                    'error': 'Invalid feedback ID'
                }), 400
            
            # Delete feedback
            result = self.feedback_collection.delete_one({'_id': obj_id})
            
            if result.deleted_count == 0:
                return jsonify({
                    'error': 'Feedback not found'
                }), 404
            
            return jsonify({
                'success': True,
                'message': 'Feedback deleted successfully'
            }), 200
            
        except Exception as e:
            print(f"Error in delete_feedback: {str(e)}")
            return jsonify({
                'error': 'Failed to delete feedback',
                'message': str(e)
            }), 500