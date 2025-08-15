# AK-HearteBeSpoken 西装定制系统

这是一个西装定制订单管理系统，包含订单录入、订单查看和数据分析功能。

## 技术栈
- 后端: Python FastAPI
- 前端: React
- 数据库: SQLite (开发环境)

## 项目结构
```
suit_crm/
├── backend/           # FastAPI 后端
├── frontend/          # React 前端
└── README.md
```

## 安装说明

### 后端设置
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 前端设置
```bash
cd frontend
npm install
npm start
```

## 功能特点
- 订单录入系统
- 订单查看界面
- 数据分析仪表板
