from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from sqlalchemy import ForeignKeyConstraint

db = SQLAlchemy()


def db_drop_and_create_all(app):
    with app.app_context():
        db.drop_all()
        db.create_all()


class Level(db.Model):
    __tablename__ = 'levels'

    level_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    min_points = db.Column(db.Integer)
    max_points = db.Column(db.Integer)
    description = db.Column(db.String(255))
    users = db.relationship('User',back_populates='level')


class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    registration_date = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
    points = db.Column(db.Integer, default=0)  # total points earned by the user
    level_id = db.Column(db.Integer, db.ForeignKey('levels.level_id'))  # current level of the user

    # 用户等级
    level = db.relationship('Level', back_populates='users')
    task_templates = db.relationship('TaskTemplate',back_populates='user')
    goal_templates = db.relationship('GoalTemplate',back_populates='user')
    points_history = db.relationship('UserPointsHistory',back_populates='user')
    goals = db.relationship('Goal',back_populates='user')
    tasks = db.relationship('Task',back_populates='user')
    teams_created = db.relationship('Team', back_populates='created_by_user')
    team_memberships = db.relationship('TeamMember', back_populates='user')
    task_dependence=db.relationship('TaskDependence',back_populates='user')


class Team(db.Model):
    __tablename__ = 'teams'

    team_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    created_by_user = db.relationship('User', back_populates='teams_created')
    members = db.relationship('TeamMember', back_populates='team')
    goals = db.relationship('Goal',back_populates='team')


class TeamMember(db.Model):
    __tablename__ = 'team_members'

    team_id = db.Column(db.Integer, db.ForeignKey('teams.team_id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    role = db.Column(db.String(50))
    joined_at = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))

    team = db.relationship('Team', back_populates='members')
    user = db.relationship('User', back_populates='team_memberships')


class Goal(db.Model):
    __tablename__ = 'goals'

    goal_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    progress_percentage = db.Column(db.Float, default=0.0)
    points_earned = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    parent_goal_id = db.Column(db.Integer, db.ForeignKey('goals.goal_id'), nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.team_id'), nullable=True)
    is_root = db.Column(db.Boolean, default=False)
    category=db.Column(db.Integer,nullable=True)
    status=db.Column(db.Integer,nullable=True)
    progress=db.Column(db.Integer,nullable=True)
    root_goal_id = db.Column(db.Integer, db.ForeignKey('goals.goal_id'), nullable=True)
    sub_goals = db.relationship('Goal', backref=db.backref('parent_goal', remote_side=[goal_id]),foreign_keys=[parent_goal_id])
    user = db.relationship('User', back_populates='goals')
    tasks = db.relationship('Task',back_populates='goal')
    team = db.relationship('Team', back_populates='goals')

    __table_args__ = (
        ForeignKeyConstraint(['parent_goal_id'], ['goals.goal_id'], ondelete='CASCADE'),
    )


class GoalTemplate(db.Model):
    __tablename__ = 'goal_templates'

    template_id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    categories = db.Column(db.String(255), nullable=True)
    created_time = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), nullable=True)
    goal_structure = db.Column(db.Text, nullable=True)  # 格式化数据 json格式的字符串
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    user = db.relationship('User',back_populates='goal_templates')


class Category(db.Model):
    __tablename__ = 'categories'

    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    tasks = db.relationship('Task',back_populates='category')


class Task(db.Model):
    __tablename__ = 'tasks'

    task_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    expected_completion_time = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.Integer, default=1)
    point = db.Column(db.Integer, default=0, nullable=True)  # benefit
    repeat_cycle = db.Column(db.String(50), nullable=True)
    completed = db.Column(db.Boolean, default=False)

    goal_id = db.Column(db.Integer, db.ForeignKey('goals.goal_id'))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    reminder_24h_sent = db.Column(db.Boolean, default=False)  # reminder sent 24h before the task
    reminder_12h_sent = db.Column(db.Boolean, default=False)  # reminder sent 12h before the task
    front_task_id = db.Column(db.Integer, db.ForeignKey('tasks.task_id'), nullable=True)
    next_task = db.relationship('Task', backref=db.backref('front_task', remote_side=[task_id]), uselist=False)
    category = db.relationship('Category', back_populates='tasks')
    goal = db.relationship('Goal', back_populates='tasks')
    points_history = db.relationship('UserPointsHistory',back_populates='task')
    pomodoro_session = db.relationship('PomodoroSession',back_populates='task')
    user=db.relationship('User',back_populates='tasks')


class UserPointsHistory(db.Model):
    __tablename__ = 'user_points_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.task_id'))
    points = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)
    earned_at = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
    user = db.relationship('User', back_populates='points_history')
    task = db.relationship('Task', back_populates='points_history', uselist=False)


class TaskDependence(db.Model):
    __tablename__ = 'task_dependence'

    dependence_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    create_time = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), nullable=True)
    dependence_structure = db.Column(db.Text, nullable=True)  # 依赖任务
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    user = db.relationship('User', back_populates='task_dependence')


class TaskTemplate(db.Model):
    __tablename__ = 'task_templates'

    template_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    categories = db.Column(db.String(255), nullable=True)
    create_time = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), nullable=True)
    task_structure = db.Column(db.Text, nullable=True)  # 格式化任务
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    user = db.relationship('User', back_populates='task_templates')


class PomodoroSession(db.Model):
    __tablename__ = 'pomodoro_sessions'

    session_id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.task_id'))
    start_time = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
    end_time = db.Column(db.DateTime, nullable=True)
    duration = db.Column(db.Integer, nullable=True)
    # 剩余时间 s单位
    remaining_time = db.Column(db.Integer, nullable=True)
    is_stop = db.Column(db.Boolean, default=False)
    is_break = db.Column(db.Boolean, default=False)
    task = db.relationship('Task', back_populates='pomodoro_session', uselist=False)
