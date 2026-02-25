from datetime import datetime, timedelta
from flask import request, jsonify
from src.Utils.Database import db


def get_drive_deadline_notifications():
    """
    Compute deadline-related notifications for all active drives of a company.
    Returns friendly reminders — not enforcement.
    
    Query params: company_id (required)
    """
    company_id = request.args.get("company_id")
    if not company_id:
        return jsonify({"error": "company_id is required"}), 400

    try:
        # Fetch all non-completed drives for this company
        completed_statuses = ["selectionEmailSent", "completed"]
        drives = list(db.drives.find({
            "company_id": company_id,
            "status": {"$nin": completed_statuses}
        }))

        notifications = []
        now = datetime.utcnow()

        for drive in drives:
            end_date_raw = drive.get("end_date")
            if not end_date_raw:
                continue

            # Parse end_date (handle both string and datetime)
            if isinstance(end_date_raw, str):
                try:
                    end_date = datetime.fromisoformat(end_date_raw.replace("Z", "+00:00")).replace(tzinfo=None)
                except ValueError:
                    try:
                        end_date = datetime.strptime(end_date_raw, "%Y-%m-%d")
                    except ValueError:
                        continue
            elif isinstance(end_date_raw, datetime):
                end_date = end_date_raw.replace(tzinfo=None)
            else:
                continue

            # Calculate days remaining (negative = overdue)
            diff = end_date - now
            days_remaining = diff.days

            # Determine notification type and urgency
            notification = None

            if days_remaining < 0:
                # Overdue
                overdue_days = abs(days_remaining)
                notification = {
                    "type": "deadline_overdue",
                    "urgency": "overdue",
                    "message": f"The drive for \"{drive.get('role', 'Unknown Role')}\" is overdue by {overdue_days} day{'s' if overdue_days != 1 else ''}. You can extend the deadline to continue.",
                    "days_remaining": days_remaining,
                    "overdue_days": overdue_days,
                }
            elif days_remaining == 0:
                # Deadline today
                notification = {
                    "type": "deadline_today",
                    "urgency": "critical",
                    "message": f"The drive for \"{drive.get('role', 'Unknown Role')}\" has its deadline today! Please wrap up or extend if needed.",
                    "days_remaining": 0,
                }
            elif days_remaining <= 3:
                # 1-3 days remaining
                notification = {
                    "type": "deadline_soon",
                    "urgency": "warning",
                    "message": f"The drive for \"{drive.get('role', 'Unknown Role')}\" has {days_remaining} day{'s' if days_remaining != 1 else ''} remaining. Make sure to complete the pending steps on time.",
                    "days_remaining": days_remaining,
                }
            elif days_remaining <= 7:
                # 4-7 days remaining — gentle info
                notification = {
                    "type": "deadline_approaching",
                    "urgency": "info",
                    "message": f"The drive for \"{drive.get('role', 'Unknown Role')}\" has {days_remaining} days remaining.",
                    "days_remaining": days_remaining,
                }

            if notification:
                notification.update({
                    "drive_id": str(drive["_id"]),
                    "job_id": drive.get("job_id"),
                    "role": drive.get("role", "Unknown Role"),
                    "end_date": end_date.isoformat(),
                    "current_status": drive.get("status"),
                    "current_stage": drive.get("currentStage", 0),
                    "total_stages": len(drive.get("stages", [])),
                })
                notifications.append(notification)

        # Sort: overdue first, then by days_remaining ascending
        urgency_order = {"overdue": 0, "critical": 1, "warning": 2, "info": 3}
        notifications.sort(key=lambda n: (urgency_order.get(n["urgency"], 99), n["days_remaining"]))

        # Build summary
        summary = {
            "total": len(notifications),
            "overdue": sum(1 for n in notifications if n["urgency"] == "overdue"),
            "critical": sum(1 for n in notifications if n["urgency"] == "critical"),
            "warning": sum(1 for n in notifications if n["urgency"] == "warning"),
            "info": sum(1 for n in notifications if n["urgency"] == "info"),
        }

        return jsonify({
            "notifications": notifications,
            "summary": summary,
        }), 200

    except Exception as e:
        print(f"❌ Error in get_drive_deadline_notifications: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500
