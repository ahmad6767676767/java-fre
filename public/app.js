const chat = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");
const newChatButton = document.getElementById("newChat");
const themeButton = document.getElementById("themeBtn");
const history = document.getElementById("history");
const menuButton = document.getElementById("menuBtn");

let messages = [];

function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "You" : "N";

  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;

  wrapper.appendChild(avatar);
  wrapper.appendChild(content);

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;

  return content;
}

async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message) return;

  const welcome = document.querySelector(".welcome");
  if (welcome) welcome.remove();

  messageInput.value = "";
  messageInput.style.height = "auto";

  addMessage("user", message);

  messages.push({
    role: "user",
    text: message
  });

  const aiMessage = addMessage("assistant", "NovaBot is thinking...");

  sendButton.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    aiMessage.textContent = data.reply;

    messages.push({
      role: "assistant",
      text: data.reply
    });

    saveChat(message);

  } catch (error) {
    aiMessage.textContent =
      "Sorry, I couldn't connect to Gemini right now.";
    console.error(error);
  }

  sendButton.disabled = false;
}

function saveChat(firstMessage) {
  const chats = JSON.parse(
    localStorage.getItem("novabot-chats") || "[]"
  );

  chats.unshift({
    title: firstMessage.slice(0, 35),
    messages: messages
  });

  localStorage.setItem(
    "novabot-chats",
    JSON.stringify(chats.slice(0, 20))
  );

  loadHistory();
}

function loadHistory() {
  history.innerHTML = "";

  const chats = JSON.parse(
    localStorage.getItem("novabot-chats") || "[]"
  );

  chats.forEach((item) => {
    const button = document.createElement("div");

    button.className = "history-item";
    button.textContent = item.title;

    button.onclick = () => {
      chat.innerHTML = "";
      messages = item.messages || [];

      messages.forEach((msg) => {
        addMessage(
          msg.role === "user" ? "user" : "assistant",
          msg.text
        );
      });
    };

    history.appendChild(button);
  });
}

function newChat() {
  messages = [];

  chat.innerHTML = `
    <div class="welcome">
      <div class="big-logo">N</div>
      <h1>How can I help you?</h1>
      <p>Ask NovaBot anything.</p>

      <div class="suggestions">
        <button>Explain something to me</button>
        <button>Help me write something</button>
        <button>Help me code</button>
        <button>Help me study</button>
      </div>
    </div>
  `;

  addSuggestionListeners();
}

function addSuggestionListeners() {
  document.querySelectorAll(".suggestions button").forEach((button) => {
    button.onclick = () => {
      messageInput.value = button.textContent;
      sendMessage();
    };
  });
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height =
    Math.min(messageInput.scrollHeight, 150) + "px";
});

newChatButton.addEventListener("click", newChat);

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light");

  localStorage.setItem(
    "novabot-theme",
    document.body.classList.contains("light")
      ? "light"
      : "dark"
  );
});

menuButton.addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

if (localStorage.getItem("novabot-theme") === "light") {
  document.body.classList.add("light");
}

loadHistory();
addSuggestionListeners();
