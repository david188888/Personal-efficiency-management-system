import json

from flask import Blueprint, request, jsonify
from model import *
from sqlalchemy.exc import IntegrityError

bp = Blueprint('api', __name__)


@bp.route('/api/add_change_goals', methods=['POST'])
def add_change_goals():
    data = request.json
    title = data.get('title', '')
    description = data.get('description', '')
    user_id = int(data.get('user_id', None)) if data.get('user_id') is not None else None
    start_date = data.get('start_date', None)
    start_date = datetime.strptime(start_date,
                                   '%Y-%m-%dT%H:%M:%S') if start_date is not None and start_date != '' else None
    end_date = data.get('end_date', None)
    end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S') if end_date is not None and end_date != '' else None
    template_id = int(data.get('template_id', None)) if data.get('template_id') is not None else None
    team_id = int(data.get('team_id', None)) if data.get('team_id') is not None else None
    parent_goal_id = int(data.get('parent_goal_id', None)) if data.get('parent_goal_id') is not None else None
    goal_id = int(data.get('goal_id', None)) if data.get('goal_id') is not None else None
    goal = Goal.query.get(goal_id)
    message = ''

    if goal:
        try:
            goal.title = title
            goal.description = description
            goal.start_date = start_date
            goal.end_date = end_date
            goal.user_id = user_id
            goal.template_id = template_id
            goal.team_id = team_id
            goal.parent_goal_id = parent_goal_id
            db.session.commit()
            message = 'Goal Updated'
        except IntegrityError as e:
            db.session.rollback()
            error_message = str(e)
            if 'team_id' in error_message:
                message = 'Invalid foreign key for team_id'
            if 'parent_goal_id' in error_message:
                message = 'Invalid foreign key for parent_goal_id'
            if 'user_id' in error_message:
                message = 'Invalid foreign key for user_id'
            if 'template_id' in error_message:
                message = 'Invalid foreign key for template_id'

    else:
        try:
            new_goal = Goal(
                title=title,
                description=description,
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                template_id=template_id,
                team_id=team_id,
                parent_goal_id=parent_goal_id,
            )
            db.session.add(new_goal)
            db.session.commit()
            message = 'Goal Created'
        except IntegrityError as e:
            db.session.rollback()
            error_message = str(e)
            if 'team_id' in error_message:
                message = 'Invalid foreign key for team_id'
            if 'parent_goal_id' in error_message:
                message = 'Invalid foreign key for parent_goal_id'
            if 'user_id' in error_message:
                message = 'Invalid foreign key for user_id'
            if 'template_id' in error_message:
                message = 'Invalid foreign key for template_id'

    return jsonify({'message': message}), 201


@bp.route('/api/get_goals/<int:id>', methods=['GET'])
def get_goals(id):
    goal_id = id
    goal = Goal.query.get(goal_id)
    if not goal:
        return jsonify({'message': "goal doesn't exist"}), 404
    else:
        goal = {
            'user_id': goal.user_id,
            'goal_id': goal.goal_id,
            'title': goal.title,
            'description': goal.description,
            'start_date': goal.start_date.isoformat() if goal.start_date else None,
            'end_date': goal.end_date.isoformat() if goal.end_date else None,
            'template_id': goal.template_id,
            'team_id': goal.team_id,
            'parent_goal_id': goal.parent_goal_id
        }
        sub_goals = []
        sub_goals_list = Goal.query.filter(Goal.parent_goal_id == id).all()
        for sub_goal in sub_goals_list:
            goal_object = {
                'user_id': sub_goal.user_id,
                'goal_id': sub_goal.goal_id,
                'title': sub_goal.title,
                'description': sub_goal.description,
                'start_date': sub_goal.start_date.isoformat() if sub_goal.start_date else None,
                'end_date': sub_goal.end_date.isoformat() if sub_goal.end_date else None,
                'template_id': sub_goal.template_id,
                'team_id': sub_goal.team_id,
                'parent_goal_id': sub_goal.parent_goal_id
            }
            sub_goals.append(goal_object)
        response = {'goal': goal, 'sub_goals': sub_goals}

        return jsonify(response), 200


@bp.route('/api/delete_goals/<int:id>', methods=['GET'])
def delete_goals(id):
    goal_id = id
    goal = Goal.query.get(goal_id)
    if goal:
        sub_goals_list = Goal.query.filter(Goal.parent_goal_id == goal_id).all()
        print(sub_goals_list)
        for sub_goal in sub_goals_list:
            db.session.delete(sub_goal)
        db.session.delete(goal)
        db.session.commit()
        message = 'Goal and SubGoals Deleted'
        return jsonify(message), 201
    else:
        message = 'Goal Not Found'
        return jsonify(message), 404


@bp.route('/api/get_goal_templates/<int:id>', methods=['GET'])
def get_goal_templates(id):
    template_id = int(id)
    template = GoalTemplate.query.get(template_id)
    if not template:
        return jsonify({'message': "template doesn't exist"})
    else:

        structure = template.structure
        template = {
            'name': template.name,
            'description': template.description,
            'categories': template.categories,
            'create_time': template.create_time,
            'user_id': template.id,
        }
        if not structure and structure != '':
            structure_data = json.loads(structure)
            goal = structure_data['goal']
            sub_goals = structure_data['sub_goals']
            template['goal'] = goal
            template['sub_goals'] = sub_goals
    return jsonify({"templates": template}), 200


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
