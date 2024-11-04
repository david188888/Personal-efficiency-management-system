from flask import Blueprint, request, jsonify

bp = Blueprint('api', __name__)


@bp.route('/api/goals', methods=['POST'])
def add_goal():
    title = request.json.get('title')
    description = request.json.get('description')
    return jsonify({"message": "Goal added", "goal": {"title": title, "description": description}}), 201


@bp.route('/api/goals', methods=['GET'])
def get_goals():
    return jsonify({"goals": []}), 200


@bp.route('/api/goals/<int:id>', methods=['GET'])
def get_goal(id):
    return jsonify({"goal": {"id": id}}), 200


@bp.route('/api/templates/goals', methods=['GET'])
def get_goal_templates():
    return jsonify({"templates": []}), 200


@bp.route('/api/goals/<int:id>/progress', methods=['GET'])
def get_goal_progress(id):
    return jsonify({"progress": {"id": id, "status": "In progress"}}), 200


@bp.route('/api/goals/<int:id>/achievements', methods=['POST'])
def add_achievement(id):
    points = request.json.get('points')
    level = request.json.get('level')
    return jsonify({"message": "Achievement added", "achievement": {"points": points, "level": level}}), 201


@bp.route('/api/tasks', methods=['POST'])
def add_task():
    goal_id = request.json.get('goal_id')
    title = request.json.get('title')
    description = request.json.get('description')
    due_date = request.json.get('due_date')
    return jsonify({"message": "Task added", "task": {"goal_id": goal_id, "title": title, "description": description,
                                                      "due_date": due_date}}), 201


@bp.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify({"tasks": []}), 200


@bp.route('/api/tasks/<int:id>', methods=['GET'])
def get_task(id):
    return jsonify({"task": {"id": id}}), 200


@bp.route('/api/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    title = request.json.get('title')
    due_date = request.json.get('due_date')
    priority = request.json.get('priority')
    category = request.json.get('category')
    repeat_cycle = request.json.get('repeat_cycle')
    return jsonify({"message": "Task updated",
                    "task": {"title": title, "due_date": due_date, "priority": priority, "category": category,
                             "repeat_cycle": repeat_cycle}}), 200


@bp.route('/api/tasks/filter', methods=['GET'])
def filter_tasks():
    category = request.args.get('category')
    goal_id = request.args.get('goal_id')
    is_completed = request.args.get('is_completed')
    return jsonify({"tasks": []}), 200


@bp.route('/api/task-templates', methods=['POST'])
def add_task_template():
    template_name = request.json.get('template_name')
    template_details = request.json.get('template_details')
    return jsonify({"message": "Task template created",
                    "template": {"template_name": template_name, "template_details": template_details}}), 201


@bp.route('/api/task-templates', methods=['GET'])
def get_task_templates():
    return jsonify({"templates": []}), 200


@bp.route('/api/tasks/<int:id>/reminders', methods=['PATCH'])
def set_task_reminders(id):
    reminder_times = request.json.get('reminder_times')
    return jsonify({"message": "Reminders set", "reminders": reminder_times}), 200


@bp.route('/api/tasks/<int:id>/start-timer', methods=['POST'])
def start_task_timer(id):
    return jsonify({"message": "Timer started", "task_id": id}), 200


@bp.route('/api/tasks/<int:id>/timer', methods=['GET'])
def get_task_timer(id):
    return jsonify({"task_id": id, "timer_status": "Running"}), 200


@bp.route('/api/tasks/<int:id>/timer-reminder', methods=['PATCH'])
def set_timer_reminder(id):
    reminder = request.json.get('reminder')
    return jsonify({"message": "Timer reminder set", "reminder": reminder}), 200


@bp.route('/api/time-management', methods=['GET'])
def get_time_distribution():
    return jsonify({"time_distribution": {}}), 200


@bp.route('/api/pomodoro', methods=['POST'])
def set_pomodoro():
    work_duration = request.json.get('work_duration')
    rest_duration = request.json.get('rest_duration')
    return jsonify(
        {"message": "Pomodoro set", "pomodoro": {"work_duration": work_duration, "rest_duration": rest_duration}}), 201


@bp.route('/api/pomodoro/status', methods=['GET'])
def get_pomodoro_status():
    return jsonify({"status": "Running"}), 200


@bp.route('/api/teams', methods=['POST'])
def create_team():
    team_name = request.json.get('team_name')
    members = request.json.get('members')
    return jsonify({"message": "Team created", "team": {"team_name": team_name, "members": members}}), 201


@bp.route('/api/teams/<int:id>', methods=['GET'])
def get_team(id):
    return jsonify({"team": {"id": id}}), 200


@bp.route('/api/tasks/<int:id>/dependencies', methods=['POST'])
def set_task_dependencies(id):
    dependent_on = request.json.get('dependent_on')
    return jsonify({"message": "Dependencies set", "dependencies": {"dependent_on": dependent_on}}), 201
