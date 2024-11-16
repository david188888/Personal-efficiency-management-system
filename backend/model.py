from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


def db_drop_and_create_all(app):
    with app.app_context():
        db.drop_all()
        db.create_all()


class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    registration_date = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
    points = db.Column(db.Integer, default=0)  # total points earned by the user

    level_id = db.Column(db.Integer, db.ForeignKey('levels.level_id'))  # current level of the user

    levels = db.relationship('Level', back_populates='user')
    teams_created = db.relationship('Team', back_populates='created_by_user')
    goals_created = db.relationship('Goal', back_populates='user')
    task_templates = db.relationship('TaskTemplate', back_populates='user')
    points_history = db.relationship('UserPointsHistory', back_populates='user')
    pomodoro_sessions = db.relationship('PomodoroSession', back_populates='user')
    team_memberships = db.relationship('TeamMember', back_populates='user')


class Level(db.Model):
    __tablename__ = 'levels'

    level_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    min_points = db.Column(db.Integer)
    max_points = db.Column(db.Integer)
    description = db.Column(db.String(255))

    user = db.relationship('User', back_populates='levels')


class Team(db.Model):
    __tablename__ = 'teams'

    team_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)

    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))

    created_by_user = db.relationship('User', back_populates='teams_created')
    members = db.relationship('TeamMember', back_populates='team')
    goals = db.relationship('Goal', back_populates='team')


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

    parent_goal_id = db.Column(db.Integer, db.ForeignKey('goals.goal_id'), nullable=True)
    template_id = db.Column(db.Integer, db.ForeignKey('goal_templates.template_id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.team_id'), nullable=True)

    subgoals = db.relationship('Goal', backref=db.backref('parent_goal', remote_side=[goal_id]))
    user = db.relationship('User', back_populates='goals_created')
    team = db.relationship('Team', back_populates='goals')

class GoalTemplate(db.Model):
    __tablename__ = 'goal_templates'

    template_id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    categories = db.Column(db.String(255), nullable=True)
    create_time = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None),nullable=True)
    structure = db.Column(db.Text, nullable=True)  # 格式化目标
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'),nullable=True)
    user = db.relationship('User')

class Task(db.Model):
    __tablename__ = 'tasks'

    task_id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.goal_id'))
    assigned_to_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    assigned_to_team_id = db.Column(db.Integer, db.ForeignKey('teams.team_id'))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    expected_completion_time = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.Integer, default=1)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'))
    repeat_cycle = db.Column(db.String(50), nullable=True)
    completed = db.Column(db.Boolean, default=False)
    template_id = db.Column(db.Integer, db.ForeignKey('task_templates.template_id'))
    reminder_24h_sent = db.Column(db.Boolean, default=False)  # reminder sent 24h before the task
    reminder_12h_sent = db.Column(db.Boolean, default=False)  # reminder sent 12h before the task
    depends_on_task_id = db.Column(db.Integer, db.ForeignKey('tasks.task_id'))

    points_history = db.relationship('UserPointsHistory', back_populates='task')
    category = db.relationship('Category', back_populates='tasks')
    dependencies = db.relationship('Task', backref=db.backref('depends_on_task', remote_side=[task_id]))





class UserPointsHistory(db.Model):
    __tablename__ = 'user_points_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.task_id'))
    points = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)
    earned_at = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))

    user = db.relationship('User', back_populates='points_history')
    task = db.relationship('Task', back_populates='points_history')


class TaskTemplate(db.Model):
    __tablename__ = 'task_templates'

    template_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    default_priority = db.Column(db.Integer, nullable=True)
    default_category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'))

    user = db.relationship('User', back_populates='task_templates')


class PomodoroSession(db.Model):  # each session is a pomodoro or a break
    __tablename__ = 'pomodoro_sessions'

    session_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.task_id'))
    start_time = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
    end_time = db.Column(db.DateTime, nullable=True)
    duration = db.Column(db.Integer, nullable=False)
    is_break = db.Column(db.Boolean, default=False)

    user = db.relationship('User', back_populates='pomodoro_sessions')


class Category(db.Model):
    __tablename__ = 'categories'

    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)

    tasks = db.relationship('Task', back_populates='category')
