Step 1: Open the Project in VS Code
Open VS Code.
Click File > Open Folder...
Select the folder where your project is located (e:\product).

Step 2: Open the Integrated Terminal
Open the VS Code Terminal by pressing:

Shortcut: Ctrl + ` (Ctrl and the Backtick key)
Or go to the top menu and select Terminal > New Terminal.

Step 3: Initialize the Database (Seeding)
Before running the server, let's run the seeding script to create the local SQLite database (insightx.db) and inject the 4,000+ mock events, default users, experiments, and feature flags.

In the terminal, run:

powershell
python run_monorepo.py

You should see output confirming the database has been successfully created and seeded.

Step 4: Run the Python Backend Server
We will use Python's uvicorn to start the server. This serves both the REST APIs and the single-file React client (public/index.html).

In the terminal, run:
powershell

python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload(copy and paste in terminal)

Once you see the output: INFO: Uvicorn running on http://127.0.0.1:8000
Press Ctrl + Click on the URL http://127.0.0.1:8000 to open it in your browser.
Log in with the default credentials:

(sample)
Email: demo@insightx.ai
Password: demo123

Step 5: (Optional) Run the Vite React Frontend Dev Server
If you want to run the advanced Vite frontend instead of the single-file HTML client:

Open a new terminal split in VS Code (click the + icon on the top right of the terminal panel).
Move into the frontend directory:
bash


cd frontend
Install the dependencies:
bash

npm install
Start the frontend developer hot-reloading server:
bash


npm run dev
Open your browser and navigate to http://localhost:5173.

link this demo view (https://insightx-ai-product-analytics.onrender.com/)
<img width="1920" height="1080" alt="Screenshot (344)" src="https://github.com/user-attachments/assets/ceeb35eb-bde5-4876-9133-a545f784203a" />




















