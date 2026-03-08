NeuroX/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── recruiter/
│   │   │   ├── candidate/
│   │   │   ├── admin/
│   │   │   └── hr/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── jd.routes.js
│   │   │   ├── assessment.routes.js
│   │   │   ├── evaluation.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── jd.controller.js
│   │   │   ├── assessment.controller.js
│   │   │   ├── evaluation.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── job.model.js
│   │   │   ├── assessment.model.js
│   │   │   ├── submission.model.js
│   │   │   └── result.model.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── utils/
│   │   │   ├── redisClient.js
│   │   │   ├── emailService.js
│   │   │   ├── scoreCalculator.js
│   │   │   └── flaskClient.js
│   │   │
│   │   ├── config/
│   │   │   ├── supabase.js
│   │   │   ├── redis.js
│   │   │   └── env.js
│   │   │
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── README.md
│
├── ml/
│   ├── models/
│   │   ├── jd_parser.pkl
│   │   ├── integrity_model.pkl
│   │
│   ├── notebooks/
│   │   └── training.ipynb   # Kaggle
│   │
│   ├── app.py               # Flask API
│   └── requirements.txt
│
├── data/
│   ├── jd_training_data.csv
│   ├── integrity_training.csv
│
├── redis/
│   └── redis.conf
│
├── docs/
│   ├── architecture.md
│   ├── api-docs.md
│   ├── setup.md
│   └── rbac.md
│
└── README.md
