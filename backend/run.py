import json
from sqlalchemy import func
from flask import Blueprint, request, jsonify
from model import *
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from collections import defaultdict

bp = Blueprint('api', __name__)


@bp.route('/api/users/add_user', methods=['POST'])
def add_user():
    data = request.json
    username = data.get('username', '')
    password = data.get('password', '')
    email = data.get('email', '')
    level_id = int(data.get('level_id', None)) if data.get('level_id') is not None else 1

    # 检查 level_id 是否存在，如果不存在则插入新的 Level 记录
    if level_id is not None and not Level.query.get(level_id):
        new_level = Level(level_id=level_id)
        db.session.add(new_level)
        db.session.commit()

    new_user = User(
        username=username,
        password_hash=password,
        email=email,
        level_id=level_id
    )
    db.session.add(new_user)
    db.session.commit()
    # 返回新创建的用户信息和正确的状态码还有消息\
    result = {
        'user_id': new_user.user_id,
        'username': new_user.username,
        'email': new_user.email,
        'level': new_user.level_id
    }
    return jsonify({'message': 'User created', 'user': result}), 201


@bp.route('/api/users/get_user', methods=['GET'])
def get_user():
    username = request.args.get('username')
    password = request.args.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.password_hash == password:  # 直接比较明文密码
        return jsonify({'message': 'Login successful', 'user_id': user.user_id,'username':user.username}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 201
    # user_id = request.args.get('user_id')
    #     user = User.query.get(user_id)
    #     if not user:
    #         return jsonify({'message': 'User not found'}), 404
    #     result = {
    #         'user_id': user.user_id,
    #         'username': user.username,
    #         'email': user.email,
    #         'level': user.level_id
    #     }
    #     return jsonify(result), 200

@bp.route('/api/users/get_all_users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    result = []
    for user in users:
        result.append({
            'user_id': user.user_id,
            'username': user.username,
            'password': user.password_hash,
            'email': user.email,
            'level': user.level_id
        })
    return jsonify(result), 200


@bp.route('/api/goals/add_change_goal', methods=['POST'])
def add_change_goal():
    data = request.json
    title = data.get('title', '')
    description = data.get('description', '')
    user_id = int(data.get('user_id', None)) if data.get('user_id') is not None else None
    start_date = data.get('start_date', None)
    start_date = datetime.strptime(start_date,
                                   '%Y-%m-%dT%H:%M:%S') if start_date is not None and start_date != '' else None
    end_date = data.get('end_date', None)
    end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S') if end_date is not None and end_date != '' else None
    team_id = int(data.get('team_id', None)) if data.get('team_id') is not None else None
    parent_goal_id = int(data.get('parent_goal_id', None)) if data.get('parent_goal_id') is not None else None
    goal_id = int(data.get('goal_id', None)) if data.get('goal_id') is not None else None
    goal = Goal.query.get(goal_id)
    is_root = bool(data.get('is_root', False)) if data.get('is_root') is not None else None
    category=int(data.get('category',None))if data.get('category') is not None else None
    status=int(data.get('status',None)) if data.get('status') is not None else None
    progress=int(data.get('progress',None)) if data.get('progress') is not None else None
    message = ''

    if goal:
        try:
            goal.title = title
            goal.description = description
            goal.start_date = start_date
            goal.end_date = end_date
            goal.user_id = user_id
            goal.team_id = team_id
            goal.category=category
            goal.status=status
            goal.progress=progress
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

    else:
        try:
            new_goal = Goal(
                title=title,
                description=description,
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                team_id=team_id,
                parent_goal_id=parent_goal_id,
                status=status,
                progress=progress,
                category=category,
            )
            db.session.add(new_goal)
            db.session.commit()
            message = 'Goal Created'
        except IntegrityError as e:
            db.session.rollback()
            error_message = str(e)
            print(f"IntegrityError: {error_message}")
            if 'team_id' in error_message:
                message = 'Invalid foreign key for team_id'
            if 'parent_goal_id' in error_message:
                message = 'Invalid foreign key for parent_goal_id'
            if 'user_id' in error_message:
                message = 'Invalid foreign key for user_id'
          
    return jsonify({'message': message}), 201

@bp.route('/api/goals/get_goal_by_title', methods=['GET'])
def get_goal_by_title():
    goal_title = request.args.get('title')
    goal_list = Goal.query.filter_by(title=goal_title)
    goal_object_list=[]
    for goal in goal_list:
        goal_object = {
            'goal_id': goal.goal_id,
            'title': goal.title,
            'description': goal.description,
            'start_date': goal.start_date.isoformat() if goal.start_date else None,
            'end_date': goal.end_date.isoformat() if goal.end_date else None,
            'user_id': goal.user_id,
            'team_id': goal.team_id,
            'parent_goal_id': goal.parent_goal_id,
            'status': goal.status,
            'category': goal.category,
            'progress': goal.progress
        }
        goal_object_list.append(goal_object)
    return jsonify({'goal_list':goal_object_list}),201

@bp.route('/api/goals/filter_goals', methods=['GET'])
def filter_goals():
    # 根据目标的名称类别，状态来筛选
    goal_title = request.args.get('title')
    category=request.args.get('category')
    status=request.args.get('status')

    query = Goal.query
    if goal_title:
        query = query.filter_by(title=goal_title)
    if category:
        query = query.filter_by(category=category)
    if status:
        query = query.filter_by(status=status)
    goal_list = query.all()
    goal_object_list=[]
    for goal in goal_list:
        goal_object = {
            'goal_id': goal.goal_id,
            'title': goal.title,
            'description': goal.description,
            'start_date': goal.start_date.isoformat() if goal.start_date else None,
            'end_date': goal.end_date.isoformat() if goal.end_date else None,
            'user_id': goal.user_id,
            'team_id': goal.team_id,
            'parent_goal_id': goal.parent_goal_id,
            'status': goal.status,
            'category': goal.category,
            'progress': goal.progress
        }
        goal_object_list.append(goal_object)
    return jsonify({'goal_list':goal_object_list}),201
@bp.route('/api/goals/get_goal', methods=['GET'])
def get_goal():
    goal_title = request.args.get('title')
    goal = Goal.query.filter_by(title=goal_title).first()
    if goal:
        goal_object = {
            'goal_id': goal.goal_id,
            'title': goal.title,
            'description': goal.description,
            'start_date': goal.start_date.isoformat() if goal.start_date else None,
            'end_date': goal.end_date.isoformat() if goal.end_date else None,
            'user_id': goal.user_id,
            'team_id': goal.team_id,
            'parent_goal_id': goal.parent_goal_id,
            'status':goal.status,
            'category':goal.category,
            'progress':goal.progress
        }
        return jsonify(goal_object), 200
    return jsonify({'message': "Goal doesn't exist"}), 404


@bp.route('/api/goals/get_subgoal', methods=['GET'])
def get_subgoal():
    parent_goal_id = request.args.get('parent_goal_id')
    sub_goals_list = Goal.query.filter_by(parent_goal_id=parent_goal_id)
    sub_goals_object_list = []
    for sub_goal in sub_goals_list:
        sub_goal_object = {
            'goal_id': sub_goal.goal_id,
            'title': sub_goal.title,
            'description': sub_goal.description,
            'start_date': sub_goal.start_date.isoformat() if sub_goal.start_date else None,
            'end_date': sub_goal.end_date.isoformat() if sub_goal.end_date else None,
            'user_id': sub_goal.user_id,
            'team_id': sub_goal.team_id,
            'parent_goal_id': sub_goal.parent_goal_id,
            'status':sub_goal.status,
            'category':sub_goal.category,
            'progress':sub_goal.progress
        }
        sub_goals_object_list.append(sub_goal_object)
    return jsonify(sub_goals_object_list), 200


@bp.route('/api/goals/add_subgoal', methods=['POST'])
def add_subgoal():
    data = request.json
    title  = data.get('goal_title', '')
    sub_goal = Goal.query.filter_by(title=title).first()
    sub_goal_id = sub_goal.goal_id if sub_goal else None
    title = data.get('title', '')
    description = data.get('description', '')
    start_date = data.get('start_date', None)
    start_date = datetime.strptime(start_date,
                                    '%Y-%m-%dT%H:%M:%S') if start_date is not None and start_date != '' else None
    end_date = data.get('end_date', None)
    end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S') if end_date is not None and end_date != '' else None
    user_id = int(data.get('user_id', None)) if data.get('user_id') is not None else None
    status = int(data.get('status', None)) if data.get('status') is not None else None
    category = int(data.get('category', None)) if data.get('category') is not None else None
    progress = int(data.get('progress', None)) if data.get('progress') is not None else None
    new_goal = Goal(
            title=title,
            description=description,
            start_date=start_date,
            end_date=end_date,
            user_id=user_id,
            parent_goal_id=sub_goal_id,
            status=status,
            category=category,
            progress=progress
        )
    db.session.add(new_goal)
    db.session.commit()
    return jsonify({'message': 'SubGoal created'}), 201




@bp.route('/api/goals/get_goals', methods=['GET'])
def get_goals():
    user_id = request.args.get('user_id')
    goals_list = Goal.query.filter_by(user_id=user_id).all()
    def build_goal_tree(goal):
        goal_object = {
            'user_id': goal.user_id,
            'goal_id': goal.goal_id,
            'title': goal.title,
            'description': goal.description,
            'start_date': goal.start_date.isoformat() if goal.start_date else None,
            'end_date': goal.end_date.isoformat() if goal.end_date else None,
            'team_id': goal.team_id,
            'parent_goal_id': goal.parent_goal_id,
            'status':goal.status,
            'category':goal.category,
            'progress':goal.progress,
            'sub_goals': []
        }
        sub_goals_list = goal.sub_goals
        for sub_goal in sub_goals_list:
            goal_object['sub_goals'].append(build_goal_tree(sub_goal))
        return goal_object

    goals_with_sub_goals = [build_goal_tree(goal) for goal in goals_list]

    return jsonify(goals_with_sub_goals), 200


@bp.route('/api/goals/delete_goals', methods=['GET'])
def delete_goals():
    goal_id = request.args.get('goal_id')
    goal = Goal.query.get(goal_id)

    if goal:
        sub_goals_list = goal.sub_goals
        for sub_goal in sub_goals_list:
            db.session.delete(sub_goal)
        db.session.delete(goal)
        db.session.commit()
        message = 'Goal and SubGoals Deleted'
        return jsonify(message), 201
    else:
        message = 'Goal Not Found'
        return jsonify(message), 404


@bp.route('/api/goals/get_goal_template/<int:id>', methods=['GET'])
def get_goal_template(id):
    template_id = int(id)
    template = GoalTemplate.query.get(template_id)
    if not template:
        return jsonify({'message': "template doesn't exist"})
    else:
        template = {
            'name': template.name,
            'description': template.description,
            'categories': template.categories,
            'create_time': template.created_time,
            'user_id': template.user_id,
            'template_id': template.template_id,
            'goal_structure': template.goal_structure
        }
    return jsonify({"templates": template}), 200


@bp.route('/api/goals/delete_goal_template/<int:id>', methods=['GET'])
def delete_goal_template(id):
    template_id = id
    goal_template = GoalTemplate.query.get(template_id)
    if goal_template:
        db.session.delete(goal_template)
        db.session.commit()
        message = 'Goal Template Deleted'
        return jsonify(message), 201
    else:
        message = 'Goal Template Not Found'
        return jsonify(message), 404


# 不能修改
@bp.route('/api/goals/save_goal_template', methods=['POST'])
def save_goal_template():
    # return jsonify({'message': 'test'}), 201
    data = request.json
    name = data.get('name', '')
    description = data.get('description', '')
    categories = data.get('categories', '')
    user_id = int(data.get('user_id', None)) if data.get('user_id') is not None else None
    root_goal_id = int(data.get('root_goal_id', None)) if data.get('root_goal_id') is not None else None
    goal = Goal.query.filter_by(root_goal_id=root_goal_id, is_root=True).first()
    if goal is None:
        return jsonify({"message": "Root Goal Doesn't exist"}), 404
    message = ''
    goals_list = Goal.query.all()

    def build_goal_tree(goal):
        goal_object = {
            'title': goal.title,
            'description': goal.description,
            'sub_goals': []
        }
        sub_goals_list = goal.sub_goals
        for sub_goal in sub_goals_list:
            goal_object['sub_goals'].append(build_goal_tree(sub_goal))
        return goal_object

    goal_structure = [build_goal_tree(goal) for goal in goals_list]
    try:
        new_template = GoalTemplate(
            name=name,
            description=description,
            categories=categories,
            goal_structure=json.dumps(goal_structure),
            user_id=user_id,
        )
        db.session.add(new_template)
        db.session.commit()
        message = 'Goal Template Saved'
    except IntegrityError as e:
        db.session.rollback()
        error_message = str(e)
        if 'user_id' in error_message:
            message = 'Invalid foreign key for user_id'
    return jsonify({'message': message}), 201


@bp.route('/api/goals/get_goal_progress/<int:id>', methods=['GET'])
def get_goal_progress(id):
    goal_id = id
    goal = Goal.query.get(goal_id)
    message = ''
    if goal:
        tasks = goal.tasks
        completed = 0
        for task in tasks:
            if task.completed:
                completed += 1
        if len(tasks) != 0:
            progress_percentage = (completed / len(tasks)) * 100
        else:
            progress_percentage = 0
        goal.progress_percentage = progress_percentage
        db.session.commit()
        message = f"Goal complete progress: {progress_percentage}%"
    else:
        message = "Goal doesn't exist"
    return jsonify({"message": message}), 200


@bp.route('/api/tasks/add_change_task', methods=['POST'])
def add_change_task():
    data = request.json
    user_id = int(data.get('user_id', None)) if data.get('user_id') is not None else None
    task_id = int(data.get('task_id', None)) if data.get('task_id') is not None else None
    goal_title = data.get('goal_title', '')
    goal = Goal.query.filter_by(title=goal_title).first()
    goal_id = goal.goal_id if goal else None
    title = data.get('title', '')
    description = data.get('description', '')
    start_time = data.get('start_time', None)
    print(start_time)
    start_time = datetime.strptime(start_time,
                                   '%Y-%m-%dT%H:%M:%S') if start_time is not None and start_time != '' else None
    end_time = data.get('end_time', None)
    end_time = datetime.strptime(end_time, '%Y-%m-%dT%H:%M:%S') if end_time is not None and end_time != '' else None
    expected_completion_time = data.get('expected_completion_time', None)
    expected_completion_time = datetime.strptime(expected_completion_time,
                                                 '%Y-%m-%dT%H:%M:%S') if expected_completion_time is not None and expected_completion_time != '' else None
    priority = int(data.get('priority', 1))
    point = int(data.get('point', 0)) if data.get('point') is not None else None
    repeat_cycle = data.get('repeat_cycle', '')
    completed = data.get('completed', False)
    reminder_24h_sent = data.get('reminder_24h_sent', False)
    reminder_12h_sent = data.get('reminder_12h_sent', False)
    category_id = int(data.get('category_id', None)) if data.get('category_id') is not None else None
    front_task_id = int(data.get('front_task_id', None)) if data.get(
        'front_task_id') is not None else None

    task = Task.query.get(task_id)
    message = ''

    if task:
        try:
            task.user_id = user_id
            task.goal_id = goal_id
            task.title = title
            task.description = description
            task.start_time = start_time
            task.end_time = end_time
            task.expected_completion_time = expected_completion_time
            task.priority = priority
            task.point = point
            task.repeat_cycle = repeat_cycle
            task.completed = completed
            task.reminder_24h_sent = reminder_24h_sent
            task.reminder_12h_sent = reminder_12h_sent
            task.category_id = category_id
            task.front_task_id = front_task_id
            db.session.commit()
            message = 'Task Updated'
            
            task_dict = {
                'task_id': task.task_id,
                'title': task.title,
                'goal_id': task.goal_id,
                'description': task.description,
                'start_time': task.start_time.isoformat() if task.start_time else None,
                'end_time': task.end_time.isoformat() if task.end_time else None,
                'expected_completion_time': task.expected_completion_time.isoformat() if task.expected_completion_time else None,
                'priority': task.priority,
                'point': task.point,
                'repeat_cycle': task.repeat_cycle,
                'completed': task.completed,
                'reminder_24h_sent': task.reminder_24h_sent,
                'reminder_12h_sent': task.reminder_12h_sent,
                'category_id': task.category_id,
            }
            # 将新的任务展示在前端
            return jsonify({'message': message, 'task': task_dict}), 201
        except IntegrityError as e:
            db.session.rollback()
            error_message = str(e)
            if 'goal_id' in error_message:
                message = 'Invalid foreign key for goal_id'
            elif 'category_id' in error_message:
                message = 'Invalid foreign key for category_id'
            elif 'front_task_id' in error_message:
                message = 'Invalid foreign key for front_task_id'
            return jsonify({'message': message}), 201
    else:
        try:
            new_task = Task(
                user_id=user_id,
                goal_id=goal_id,
                title=title,
                description=description,
                start_time=start_time,
                end_time=end_time,
                expected_completion_time=expected_completion_time,
                priority=priority,
                point=point,
                repeat_cycle=repeat_cycle,
                completed=completed,
                reminder_24h_sent=reminder_24h_sent,
                reminder_12h_sent=reminder_12h_sent,
                category_id=category_id,
                front_task_id=front_task_id,
            )
            db.session.add(new_task)
            db.session.commit()
            message = 'Task Created'
            #将new_task转化为json格式
            task_dict = {
                'user_id':new_task.user_id,
                'task_id': new_task.task_id,
                'title': new_task.title,
                'goal_id': new_task.goal_id,
                'description': new_task.description,
                'start_time': new_task.start_time.isoformat() if new_task.start_time else None,
                'end_time': new_task.end_time.isoformat() if new_task.end_time else None,
                'expected_completion_time': new_task.expected_completion_time.isoformat() if new_task.expected_completion_time else None,
                'priority': new_task.priority,
                'point': new_task.point,
                'repeat_cycle': new_task.repeat_cycle,
                'completed': new_task.completed,
                'reminder_24h_sent': new_task.reminder_24h_sent,
                'reminder_12h_sent': new_task.reminder_12h_sent,
                'category_id': new_task.category_id
            }
            # 将新的任务展示在前端
            return jsonify({'message': message, 'task': task_dict}), 201
        except IntegrityError as e:
            db.session.rollback()
            error_message = str(e)
            # Handle specific foreign key errors
            if 'goal_id' in error_message:
                message = 'Invalid foreign key for goal_id'
            elif 'category_id' in error_message:
                message = 'Invalid foreign key for category_id'
            elif 'front_task_id' in error_message:
                message = 'Invalid foreign key for front_task_id'

            return jsonify({'message': message}), 201


@bp.route('/api/tasks/get_tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('user_id')
    tasks_object_list = Task.query.filter_by(user_id=user_id).all()
    def build_task_chain(task, task_list):
        task_chain = {
            'task_id': task.task_id,
            'title': task.title,
            'description': task.description,
            'start_time': task.start_time.isoformat() if task.start_time else None,
            'end_time': task.end_time.isoformat() if task.end_time else None,
            'expected_completion_time': task.expected_completion_time.isoformat() if task.expected_completion_time else None,
            'priority': task.priority,
            'point': task.point,
            'category_id': task.category_id,
            'repeat_cycle': task.repeat_cycle,
            'completed': task.completed,
            'front_task_id': task.front_task_id
        }
        task_list.append(task_chain)
        if task.next_task:
            return build_task_chain(task.next_task, task_list)
        return

    all_task_chains = []
    for task in tasks_object_list:
        if task.front_task is None:
            task_list = []
            build_task_chain(task, task_list)
            all_task_chains.append(task_list)

    return jsonify(all_task_chains), 200
@bp.route('/api/tasks/filter_tasks', methods=['GET'])
def filter_tasks():
    # 传参没传value 为空字符串
    title = request.args.get('title',None)

    priority = request.args.get('priority')
    completed = request.args.get('completed')
    category_id = request.args.get('category_id')
    point = request.args.get('point')
    query = Task.query
    if title is not None :
        query = query.filter_by(title=title)
    if priority is not None:
        query = query.filter_by(priority=priority)
    if completed is not None:
        query = query.filter_by(completed=completed)
    if category_id is not None:
        query=query.filter_by(category_id=category_id)
    if point is not None:
        query = query.filter_by(point=point)

    # 执行查询，获取结果列表
    task_list = query.all()
    task_object_list = []
    for task in task_list:
        task_object = {
            'task_id': task.task_id,
            'title': task.title,
            'goal_id': task.goal_id,
            'description': task.description,
            'start_time': task.start_time.isoformat() if task.start_time else None,
            'end_time': task.end_time.isoformat() if task.end_time else None,
            'expected_completion_time': task.expected_completion_time.isoformat() if task.expected_completion_time else None,
            'priority': task.priority,
            'point': task.point,
            'repeat_cycle': task.repeat_cycle,
            'completed': task.completed,
            'reminder_24h_sent': task.reminder_24h_sent,
            'reminder_12h_sent': task.reminder_12h_sent,
            'category_id': task.category_id,
        }
        task_object_list.append(task_object)
    return jsonify({'goal_list': task_object_list}), 201
@bp.route('/api/tasks/delete_task/<int:id>', methods=['GET'])
def delete_task(id):
    task_id = id
    task = Task.query.get(task_id)
    if task:
        try:
            db.session.delete(task)
            db.session.commit()
            message = 'Task Deleted'
            return jsonify({'message': message}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    else:
        message = 'Task Not Found'
        return jsonify({'message': message}), 404


@bp.route('/api/tasks/get_task_template/<int:id>', methods=['GET'])
def get_task_template(id):
    task_template = TaskTemplate.query.get(id)
    if task_template:
        task_template_object = {
            'name': task_template.name,
            'description': task_template.description,
            'categories': task_template.categories,
            'task_structure': task_template.task_structure,
            'user_id': task_template.user_id
        }
        return jsonify({"message": 'Task Template found', 'task_template': task_template_object}), 200
    return jsonify({'message': "Task Template doesn't found"}), 404




#通过goal_idh获得task列表
@bp.route('/api/tasks/get_task_by_goal_id', methods=['GET'])
def get_task_by_goal_id():
    goal_id = request.args.get('goal_id')
    tasks = Task.query.filter_by(goal_id=goal_id)
    task_object_list = []
    for task in tasks:
        task_object = {
            'task_id': task.task_id,
            'title': task.title,
            'description': task.description,
            'start_time': task.start_time.isoformat() if task.start_time else None,
            'end_time': task.end_time.isoformat() if task.end_time else None,
            'expected_completion_time': task.expected_completion_time.isoformat() if task.expected_completion_time else None,
            'priority': task.priority,
            'point': task.point,
            'category_id': task.category_id,
            'repeat_cycle': task.repeat_cycle,
            'completed': task.completed,
        }
        task_object_list.append(task_object)
    return jsonify({'task_list': task_object_list}), 200



# 通过title，查询task的详细信息
@bp.route('/api/tasks/get_task', methods=['GET'])
def get_task():
    title = request.args.get('title')
    task_lists = Task.query.filter_by(title=title)
    task_object_list = []
    for task in task_lists:
        task_object = {
            'task_id': task.task_id,
            'title': task.title,
            'description': task.description,
            'start_time': task.start_time.isoformat() if task.start_time else None,
            'end_time': task.end_time.isoformat() if task.end_time else None,
            'priority': task.priority,
            'point': task.point,
            'completed': task.completed,
        }
        task_object_list.append(task_object)
        return jsonify({'task_list': task_object_list}), 200
    return jsonify({'message': "Task doesn't exist1"}), 404


@bp.route('/api/categories/add', methods=['POST'])
def add_category():
    data = request.json
    name = data.get('name', '')
    description = data.get('description', '')

    if not name:
        return jsonify({"message": "Name is required"}), 400

    new_category = Category(name=name, description=description)

    try:
        db.session.add(new_category)
        db.session.commit()
        return jsonify({"message": "Category created",
                        "category": {"id": new_category.category_id, "name": new_category.name,
                                     "description": new_category.description}}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Error creating category"}), 500


@bp.route('/api/tasks/save_task_template', methods=['POST'])
def save_task_template():
    data = request.json
    name = data.get('name', '')
    description = data.get('description', '')
    categories = data.get('categories', '')
    task_structure = data.get('task_structure', None)
    user_id = int(data.get('user_id', None)) if data.get('user_id') is not None else None
    message = ''
    try:
        new_template = TaskTemplate(
            name=name,
            description=description,
            categories=categories,
            task_structure=task_structure,
            user_id=user_id,
        )
        db.session.add(new_template)
        db.session.commit()
        message = 'Task Template Saved'
    except IntegrityError as e:
        db.session.rollback()
        error_message = str(e)
        if 'user_id' in error_message:
            message = 'Invalid foreign key for user_id'
    return jsonify({'message': message}), 201


@bp.route('/api/tasks/delete_task_template/<int:id>', methods=['GET'])
def delete_task_template(id):
    task_template_id = id
    task_template = TaskTemplate.query.get(task_template_id)
    if task_template:
        try:
            db.session.delete(task_template)
            db.session.commit()
            message = 'Task Template Deleted'
            return jsonify({'message': message}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    else:
        message = 'Task Template Not Found'
        return jsonify({'message': message}), 404


@bp.route('/api/tasks/get_task_dependence/<int:id>', methods=['GET'])
def get_task_dependence(id):
    task_dependence = TaskDependence.query.get(id)
    if not task_dependence:
        return jsonify({'message': "Task dependence doesn't exist"}), 404
    else:
        task_dependence_data = {
            'dependence_id': task_dependence.dependence_id,
            'name': task_dependence.name,
            'description': task_dependence.description,
            'create_time': task_dependence.create_time.isoformat() if task_dependence.create_time else None,
            'dependence_structure': task_dependence.dependence_structure,
            'user_id': task_dependence.user_id
        }
    return jsonify({"task_dependence": task_dependence_data}), 200


@bp.route('/api/tasks/save_task_dependence', methods=['POST'])
def save_task_dependence():
    data = request.json
    name = data.get('name', '')
    description = data.get('description', '')
    user_id = int(data.get('user_id', None)) if data.get('user_id') else None
    head_task_id = int(data.get('head_task_id', None)) if data.get('head_task_id') else None
    head_task = Task.query.get(head_task_id)
    task_list = []

    def create_task_chain(task):
        task_object = {
            "title": task.title,
            "description": task.description,
            'start_time': task.start_time.isoformat() if task.start_time else None,
            'end_time': task.end_time.isoformat() if task.end_time else None,
            'expected_completion_time': task.expected_completion_time.isoformat() if task.expected_completion_time else None,
            "priority": task.priority,
            "point": task.point,
            "repeat_cycle": task.repeat_cycle,
            "completed": task.completed
        }
        task_list.append(task_object)
        if task.next_task is None:
            return
        else:
            return create_task_chain(task.next_task)

    create_task_chain(head_task)
    new_task_dependence = TaskDependence(
        name=name,
        description=description,
        user_id=user_id,
        dependence_structure=json.dumps(task_list)
    )
    db.session.add(new_task_dependence)
    db.session.commit()
    return jsonify({"message": "task_dependence saved"}), 200


@bp.route('/api/tasks/delete_task_dependence/<int:id>', methods=['GET'])
def delete_task_dependence(id):
    dependence_id = id
    task_dependence = TaskDependence.query.get(dependence_id)

    if task_dependence:
        try:
            db.session.delete(task_dependence)
            db.session.commit()
            return jsonify({'message': 'Task Dependence Deleted'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error deleting Task Dependence', 'error': str(e)}), 500
    else:
        return jsonify({'message': 'Task Dependence Not Found'}), 404


@bp.route('/api/tasks/set_task_timer', methods=['POST'])
def set_task_timer():
    data = request.json
    task_id = int(data.get('task_id', None)) if data.get('task_id') else None
    duration = int(data.get('duration', None)) if data.get('duration') else None
    message = ''
    try:
        new_pomodoro_session = PomodoroSession(
            task_id=task_id,
            duration=duration,
            remaining_time=duration
        )
        db.session.add(new_pomodoro_session)
        db.session.commit()
        message = 'task_timer set up'
    except Exception as e:
        db.session.rollback()
        error_message = str(e)
        print(e)
        if 'task_id' in error_message:
            message = 'Invalid Foreignkey task_id'
    return jsonify({'message': message}), 201


@bp.route('/api/tasks/get_task_timer/<int:id>', methods=['GET'])
def get_task_timer(id):
    task_id = id
    task = Task.query.get(task_id)
    if task is None:
        return jsonify({"message": "Task doesn't exist"}), 404
    pomodoro_session = task.pomodoro_session[0]
    if pomodoro_session:
        new_pomodoro_session = {
            "task_id": pomodoro_session.task_id,
            "start_time": pomodoro_session.start_time,
            "end_time": pomodoro_session.end_time,
            "duration": pomodoro_session.duration,
            "remaining_time": pomodoro_session.remaining_time,
            "is_break": pomodoro_session.is_break,
            "is_stop": pomodoro_session.is_stop
        }
        return jsonify({'pomodoro_session': new_pomodoro_session}), 200
    else:
        return jsonify({"message": "Timer doesn't set up"}), 404


@bp.route('/api/tasks/stop_task_timer', methods=['POST'])
def stop_task_timer():
    data = request.json
    task_id = int(data.get('task_id', None)) if data.get('task_id') else None
    remaining_time = int(data.get('remaining_time', None)) if data.get('remaining_time') else None
    task = Task.query.get(task_id)
    if task is None:
        return jsonify({"message": "Task doesn't exist"}), 404
    pomodoro_session = task.pomodoro_session[0]
    pomodoro_session.is_stop = True
    pomodoro_session.remaining_time = remaining_time
    db.session.commit()
    return jsonify({"message": 'Timer Stop'}), 200


@bp.route('/api/tasks/start_task_timer/<int:id>', methods=['GET'])
def start_task_timer(id):
    task_id = id
    task = Task.query.get(task_id)
    if task is None:
        return jsonify({"message": "Task doesn't exist"}), 404
    pomodoro_session = task.pomodoro_session[0]
    pomodoro_session.is_stop = False
    db.session.commit()
    return jsonify({"message": 'Timer Started/Restarted'}), 200


@bp.route('/api/tasks/end_task_timer/<int:id>', methods=['GET'])
def end_task_timer(id):
    task_id = id
    task = Task.query.get(task_id)
    if task is None:
        return jsonify({"message": "Task doesn't exist"}), 404
    pomodoro_session = task.pomodoro_session
    print(pomodoro_session)
    pomodoro_session.end_time = datetime.now(timezone.utc).replace(tzinfo=None)
    pomodoro_session.is_break = True
    pomodoro_session.remaining_time = 0
    db.session.commit()
    return jsonify({"message": 'Timer end'}), 200

@bp.route('/api/tasks/finish_task',methods=['GET'])
def finish_task():
    task_id=request.args.get('task_id')
    task=Task.query.get(task_id)
    if task:
        task.completed=True
        max_level = Level.query.with_entities(func.max(Level.level_id)).scalar()
        #此处未算共同任务
        user=task.user
        if user:
            points=user.points
            points+=1
            level=user.level_id
            if points>=10:
                points= points % 10
                if level<max_level:
                    level+=1

            user_point_history= UserPointsHistory(
                user_id=user.user_id,
                task_id=task_id,
                points=1,
                description='完成任务获得一个积分')
            db.session.add(user_point_history)
            user.level_id=level
            user.points=points
        else:
            return jsonify({"message": "Task owner doesn't exist "}), 200
        db.session.commit()
    else:
        return jsonify({"message": "Task doesn't exist " }), 200
    return jsonify({"message": 'Task finished! You earned points! ','points': points, 'level': level}), 200

# 在某一个日期范围内（以start_time 或end_time为区间）内搜索所有任务
@bp.route('/api/tasks/time_management', methods=['GET'])
def time_management():
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    
    user_id = request.args.get('user_id')

    start_time = datetime.strptime(start_time, '%Y-%m-%dT%H:%M:%S')
    end_time = datetime.strptime(end_time, '%Y-%m-%dT%H:%M:%S')
    tasks = Task.query.filter(
        (Task.start_time.between(start_time, end_time) | Task.end_time.between(start_time, end_time)),Task.user_id == user_id).all()
    # 计算每个任务在指定时间范围内的总工作时间的占比

    task_duration = {}
    total_duration = 0

    for task in tasks:
        actual_start_time = task.start_time if task.start_time > start_time else start_time
        actual_end_time = task.end_time if task.end_time < end_time else end_time

        duration = (actual_end_time - actual_start_time).total_seconds()
        total_duration += duration

        task_id = task.task_id
        if task_id not in task_duration:
            task_duration[task_id] = 0
        task_duration[task_id] += duration

    # 计算每个任务和每个类别的时间占比
    result = []
    for key, duration in task_duration.items():
        rate = duration / total_duration * 100 if total_duration > 0 else 0
        result.append({
            'task_id': key,
            'task_name': Task.query.get(key).title,
            'total_work_time': duration,
            'category': Task.query.get(key).category_id,
            'rate': rate,
        })
    try:
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/tasks/task_proportion', methods=['GET'])
def task_proportion():
    try:
        start_time_str = request.args.get('start_time')
        end_time_str = request.args.get('end_time')
        user_id = request.args.get('user_id')
        start_time = datetime.strptime(start_time_str, '%Y-%m-%dT%H:%M:%S')
        end_time = datetime.strptime(end_time_str, '%Y-%m-%dT%H:%M:%S')

        tasks = Task.query.filter(
            (Task.start_time.between(start_time, end_time)) |
            (Task.end_time.between(start_time, end_time)) |
            ((Task.start_time <= start_time) & (Task.end_time >= end_time)),
            Task.user_id == user_id
        ).all()

        category_count = {}
        for task in tasks:
            # 以 category_id 作为分类字段，避免引用不存在属性
            cat_id = task.category_id if task.category_id is not None else 2
            category_count[cat_id] = category_count.get(cat_id, 0) + 1

        # 返回适配前端的数据结构
        result = []
        for cat_id, count in category_count.items():
            cat_name = 'Others'
            if cat_id == 0:
                cat_name = 'Study'
            elif cat_id == 1:
                cat_name = 'Career'
            result.append({
                'type': cat_name,
                'count': count
            })
        return jsonify(result), 200

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 该用户在最近的一周每天的任务数量和目标完成度
@bp.route('/api/tasks/time_management_bar', methods=['GET'])
def time_management_bar():
    start_time = request.args.get('start_time') #这里的start_time和end_time 强制最近的一周就行了
    end_time = request.args.get('end_time')
    user_id = request.args.get('user_id')
    start_time = datetime.strptime(start_time, '%Y-%m-%dT%H:%M:%S')
    end_time = datetime.strptime(end_time, '%Y-%m-%dT%H:%M:%S')
    
    tasks = Task.query.filter(
        Task.start_time.between(start_time, end_time) | Task.end_time.between(start_time, end_time),Task.user_id == user_id).all()

    goals = Goal.query.filter(
        Goal.start_date.between(start_time, end_time) | Goal.end_date.between(start_time, end_time),Task.user_id == user_id).all()
    
    
    
    # 计算这一周每天的任务数量,并且计算每天的任务完成程度平均值
    task_count = defaultdict(int)
    
    for task in tasks:
        date = task.start_time.date()
        week_day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][date.weekday()]
        task_count[week_day] += 1
    
    goal_counts = defaultdict(int)
    goal_total = defaultdict(float)
    # 任务完成程度平均值
    for goal in goals:
        date = goal.start_date.date()
        week_day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][date.weekday()]
        goal_total[week_day] += goal.progress_percentage
        goal_counts[week_day] += 1

    # 计算平均值
    goal_avg = {}
    for week_day in goal_total:
        if goal_counts[week_day] > 0:
            goal_avg[week_day] = goal_total[week_day] / goal_counts[week_day]
        else:
            goal_avg[week_day] = 0
        
    
    result = []
    for week_day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']:
        result.append({
            'week_day': week_day,
            'task_count': task_count.get(week_day, 0),
            'goal_progress': round(goal_avg.get(week_day, 0), 2)  # 保留两位小数
        })

    try:
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 该用户每天工作时间的折线图
@bp.route('/api/tasks/time_management_plot', methods=['GET'])
def time_manage_plot():
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    user_id = request.args.get('user_id')
    
    start_time = datetime.strptime(start_time, '%Y-%m-%dT%H:%M:%S')
    end_time = datetime.strptime(end_time, '%Y-%m-%dT%H:%M:%S')
    
    tasks = Task.query.filter(
            (Task.start_time.between(start_time, end_time)) |
            (Task.end_time.between(start_time, end_time)) |
            ((Task.start_time <= start_time) & (Task.end_time >= end_time)),
            Task.user_id == user_id
        ).all()
    
    task_duration = defaultdict(float)  # 存储每个日期的总工作时长（以小时为单位）
    
    for task in tasks:
            actual_start = max(task.start_time, start_time)
            actual_end = min(task.end_time, end_time)
            duration = (actual_end - actual_start).total_seconds() / 3600  # 转换为小时

            if duration > 0:
                task_date = actual_start.date()
                task_duration[task_date] += duration
        

        
        # 生成所有日期的列表
    num_days = (end_time.date() - start_time.date()).days + 1
    date_list = [start_time.date() + timedelta(days=i) for i in range(num_days)]

    result = []
    for date in date_list:
            duration = round(task_duration.get(date, 0), 2)  # 保留两位小数
            result.append({
                'date': date.isoformat(),
                'duration': duration  # 以小时为单位
            })

        # 按日期排序
    result.sort(key=lambda x: x['date'])

    return jsonify(result), 200

    



# # 团队协作，创建团队，插入Teams 和 TeamMembers表
# @bp.route('/api/teams/add_team', methods=['POST'])
# def add_team():
#     data = request.json
#     name = data.get('team_name', '')
#     description = data.get('description', '') if data.get('description') else ''
#     leader_id = int(data.get('created_by_user_id', None)) if data.get('leader_id') else None

#     members = data.get('members', {})
#     if not name:
#         return jsonify({'message': 'Team name is required'}), 400
#     new_team = Team(
#         name=name,
#         description=description,
#         created_by_user_id=leader_id
#     )
#     db.session.add(new_team)
#     db.session.commit()

#     for member_id, role in members.items():
#         new_member = TeamMember(
#             team_id=new_team.team_id,
#             user_id=int(member_id) if member_id else None,
#             role=role if role else 'member'
#         )
#         db.session.add(new_member)
#         db.session.commit()

#     members_name = [User.query.get(member_id).username for member_id in members.keys()]

#     result = {
#         'team_id': new_team.team_id,
#         'team_name': new_team.name,
#         'description': new_team.description,
#         'members': members_name
#     }

#     # 返回新创建的团队信息和正确的状态码还有消息
#     return jsonify({'message': 'Team created', 'team': result}), 201


# # 获取团队详情和任务
# @bp.route('/api/teams/get_team', methods=['GET'])
# def get_team():
#     team_id = request.args.get('team_id')
#     team = Team.query.get(team_id)
#     if not team:
#         return jsonify({'message': 'Team not found'}), 404
#     team_members = TeamMember.query.filter_by(team_id=team_id).all()
#     members = []
#     for member in team_members:
#         user = User.query.get(member.user_id)
#         members.append({
#             'user_id': user.user_id,
#             'username': user.username,
#             'role': member.role,
#             'joined_at': member.joined_at
#         })
#     goals = Goal.query.filter_by(team_id=team_id).all() if team_id else None
#     if not goals:
#         result = {
#             'team_id': team.team_id,
#             'team_name': team.name,
#             'description': team.description,
#             'members': members,
#         }
#         return jsonify({'message': 'there is no goals for the team', 'result': result}), 200
#     goals_list = []
#     for goal in goals:
#         goal_object = {
#             'title': goal.title,
#             'progress_percentage': goal.progress_percentage
#         }
#         goals_list.append(goal_object)

#     result = {
#         'team_id': team.team_id,
#         'team_name': team.name,
#         'description': team.description,
#         'members': members,
#         'goals': goals_list
#     }
#     return jsonify(result), 200


# # 删除团队
# @bp.route('/api/teams/delete_team', methods=['GET'])
# def delete_team():
#     team_id = request.args.get('team_id')
#     team = Team.query.get(team_id)
#     if not team:
#         return jsonify({'message': 'Team not found'}), 404
#     else:
#         db.session.delete(team)
#         db.session.commit()
#         return jsonify({'message': 'Team deleted'}), 200
