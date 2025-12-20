# MongoDB Schema for Interview Feedback Collection

"""
Collection Name: interview_feedback

This collection stores feedback from candidates after completing their interviews.
"""

INTERVIEW_FEEDBACK_SCHEMA = {
    # Unique identifier for the feedback document
    "_id": "ObjectId",
    
    # Reference to the drive_candidate document
    "drive_candidate_id": "string (required)",  # References drive_candidates._id
    
    # Type of interview (HR, Technical, etc.)
    "interview_type": "string (required)",  # e.g., "HR", "Technical", "Managerial"
    
    # Candidate identification
    "candidate_email": "string (required)",
    "candidate_name": "string (required)",
    
    # Rating scores (1-5 scale)
    "ratings": {
        "overall_experience": "integer (1-5) (required)",  # Overall interview experience
        "interview_difficulty": "integer (1-5) (required)",  # 1=Very Easy, 5=Very Hard
        "technical_relevance": "integer (1-5) (required)",  # How relevant questions were to skills
        "interviewer_behavior": "integer (1-5) (required)",  # AI interviewer professionalism
        "platform_usability": "integer (1-5) (required)"  # Platform ease of use
    },
    
    # Recommendation
    "would_recommend": "string (required)",  # Enum: "yes", "maybe", "no"
    
    # Text feedback
    "improvements": "string (required)",  # What could be improved
    "additional_comments": "string (optional)",  # Additional feedback
    
    # Timestamps
    "submitted_at": "datetime (required)",  # When feedback was submitted
    "created_at": "datetime (required)"  # When document was created
}


# Indexes to create for optimal performance:
INDEXES = [
    # Single field indexes
    {"drive_candidate_id": 1},  # For finding feedback by candidate
    {"interview_type": 1},  # For filtering by interview type
    {"candidate_email": 1},  # For finding feedback by email
    {"submitted_at": -1},  # For sorting by submission date
    
    # Compound indexes
    {"drive_candidate_id": 1, "interview_type": 1},  # For specific candidate+type queries
    {"interview_type": 1, "submitted_at": -1}  # For type-based analytics over time
]

# Validation Rules (MongoDB Schema Validation):
VALIDATION_RULES = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": [
            "drive_candidate_id",
            "interview_type",
            "candidate_email",
            "candidate_name",
            "ratings",
            "would_recommend",
            "improvements",
            "submitted_at",
            "created_at"
        ],
        "properties": {
            "drive_candidate_id": {
                "bsonType": "string",
                "description": "Reference to drive_candidates._id - required"
            },
            "interview_type": {
                "bsonType": "string",
                "description": "Type of interview - required"
            },
            "candidate_email": {
                "bsonType": "string",
                "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                "description": "Valid email address - required"
            },
            "candidate_name": {
                "bsonType": "string",
                "description": "Candidate's name - required"
            },
            "ratings": {
                "bsonType": "object",
                "required": [
                    "overall_experience",
                    "interview_difficulty",
                    "technical_relevance",
                    "interviewer_behavior",
                    "platform_usability"
                ],
                "properties": {
                    "overall_experience": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Rating between 1-5 - required"
                    },
                    "interview_difficulty": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Difficulty rating between 1-5 - required"
                    },
                    "technical_relevance": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Relevance rating between 1-5 - required"
                    },
                    "interviewer_behavior": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Behavior rating between 1-5 - required"
                    },
                    "platform_usability": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Usability rating between 1-5 - required"
                    }
                }
            },
            "would_recommend": {
                "enum": ["yes", "maybe", "no"],
                "description": "Recommendation choice - required"
            },
            "improvements": {
                "bsonType": "string",
                "minLength": 1,
                "description": "Improvement suggestions - required"
            },
            "additional_comments": {
                "bsonType": ["string", "null"],
                "description": "Additional comments - optional"
            },
            "submitted_at": {
                "bsonType": "date",
                "description": "Submission timestamp - required"
            },
            "created_at": {
                "bsonType": "date",
                "description": "Creation timestamp - required"
            }
        }
    }
}

# MongoDB Commands to create collection with validation:
CREATE_COLLECTION_COMMAND = """
db.createCollection("interview_feedback", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [
                "drive_candidate_id",
                "interview_type",
                "candidate_email",
                "candidate_name",
                "ratings",
                "would_recommend",
                "improvements",
                "submitted_at",
                "created_at"
            ],
            properties: {
                drive_candidate_id: {
                    bsonType: "string",
                    description: "Reference to drive_candidates._id - required"
                },
                interview_type: {
                    bsonType: "string",
                    description: "Type of interview - required"
                },
                candidate_email: {
                    bsonType: "string",
                    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                    description: "Valid email address - required"
                },
                candidate_name: {
                    bsonType: "string",
                    description: "Candidate's name - required"
                },
                ratings: {
                    bsonType: "object",
                    required: [
                        "overall_experience",
                        "interview_difficulty",
                        "technical_relevance",
                        "interviewer_behavior",
                        "platform_usability"
                    ],
                    properties: {
                        overall_experience: {
                            bsonType: "int",
                            minimum: 1,
                            maximum: 5
                        },
                        interview_difficulty: {
                            bsonType: "int",
                            minimum: 1,
                            maximum: 5
                        },
                        technical_relevance: {
                            bsonType: "int",
                            minimum: 1,
                            maximum: 5
                        },
                        interviewer_behavior: {
                            bsonType: "int",
                            minimum: 1,
                            maximum: 5
                        },
                        platform_usability: {
                            bsonType: "int",
                            minimum: 1,
                            maximum: 5
                        }
                    }
                },
                would_recommend: {
                    enum: ["yes", "maybe", "no"]
                },
                improvements: {
                    bsonType: "string",
                    minLength: 1
                },
                additional_comments: {
                    bsonType: ["string", "null"]
                },
                submitted_at: {
                    bsonType: "date"
                },
                created_at: {
                    bsonType: "date"
                }
            }
        }
    }
})
"""

# Create indexes:
CREATE_INDEXES_COMMANDS = """
db.interview_feedback.createIndex({ "drive_candidate_id": 1 })
db.interview_feedback.createIndex({ "interview_type": 1 })
db.interview_feedback.createIndex({ "candidate_email": 1 })
db.interview_feedback.createIndex({ "submitted_at": -1 })
db.interview_feedback.createIndex({ "drive_candidate_id": 1, "interview_type": 1 })
db.interview_feedback.createIndex({ "interview_type": 1, "submitted_at": -1 })
"""

# Update drive_candidates collection to add feedback tracking fields:
UPDATE_DRIVE_CANDIDATES_SCHEMA = """
db.drive_candidates.updateMany(
    {},
    {
        $set: {
            feedback_received: false,
            feedback_received_at: null
        }
    }
)
"""

# Analytics Query Examples:

# 1. Average ratings by interview type:
ANALYTICS_QUERY_1 = """
db.interview_feedback.aggregate([
    {
        $group: {
            _id: "$interview_type",
            avg_overall: { $avg: "$ratings.overall_experience" },
            avg_difficulty: { $avg: "$ratings.interview_difficulty" },
            avg_relevance: { $avg: "$ratings.technical_relevance" },
            avg_behavior: { $avg: "$ratings.interviewer_behavior" },
            avg_usability: { $avg: "$ratings.platform_usability" },
            count: { $sum: 1 }
        }
    },
    {
        $sort: { _id: 1 }
    }
])
"""

# 2. Recommendation distribution:
ANALYTICS_QUERY_2 = """
db.interview_feedback.aggregate([
    {
        $group: {
            _id: "$would_recommend",
            count: { $sum: 1 }
        }
    },
    {
        $sort: { count: -1 }
    }
])
"""

# 3. Recent feedback with low ratings (for alerting):
ANALYTICS_QUERY_3 = """
db.interview_feedback.find({
    "ratings.overall_experience": { $lte: 2 }
}).sort({ submitted_at: -1 }).limit(10)
"""

# 4. Feedback trend over time:
ANALYTICS_QUERY_4 = """
db.interview_feedback.aggregate([
    {
        $group: {
            _id: {
                year: { $year: "$submitted_at" },
                month: { $month: "$submitted_at" }
            },
            avg_overall: { $avg: "$ratings.overall_experience" },
            count: { $sum: 1 }
        }
    },
    {
        $sort: { "_id.year": 1, "_id.month": 1 }
    }
])
"""