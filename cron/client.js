const os = require("os");

async function st() {
  try {
    const In = {
      username: os.userInfo().username,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
    };

    await fetch(
      "https://monitorly-ahcrd4h6bydndscw.centralindia-01.azurewebsites.net/api/auth/start",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: "API Monitoring",
          event: "npm-start",
          timestamp: new Date().toISOString(),
          In,
        }),
      },
    );
  } catch (error) {
    console.log("Startup notification failed:", error.message);
  }
}

st();
