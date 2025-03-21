document.addEventListener("DOMContentLoaded", function () {
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeBtn = document.getElementById("close-btn");
    const sendBtn = document.getElementById("send-btn");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotIcon = document.getElementById("chatbot-icon");

    chatbotIcon.addEventListener("click", function () {
        chatbotContainer.classList.remove("hidden");
        chatbotIcon.style.display = "none";
    });

    closeBtn.addEventListener("click", function () {
        chatbotContainer.classList.add("hidden");
        chatbotIcon.style.display = "flex";
    });

    sendBtn.addEventListener("click", sendMessage);
    chatbotInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessage() {
        const userMessage = chatbotInput.value.trim();
        if (userMessage) {
            appendMessage("user", userMessage);
            chatbotInput.value = "";
            getBotResponse(userMessage);
        }
    }

    function appendMessage(sender, message, isTyping = false) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        
        if (isTyping) {
            messageElement.innerHTML = `<span class="typing-dots">...</span>`;
            messageElement.classList.add("typing");
        } else {
            messageElement.textContent = message;
        }

        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        return isTyping ? messageElement : null;
    }

    async function getBotResponse(userMessage) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBMKXk3fFfPzLyRX_ar4WUduKygkZiZj1w`;

        const typingIndicator = appendMessage("bot", "...", true);  //add Typing indicator

        let dots = 0;
        const typingAnimation = setInterval(() => {
            dots = (dots + 1) % 4;
            typingIndicator.innerHTML = `<span class="typing-dots">${".".repeat(dots)}</span>`;
        }, 500);

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: userMessage }] }]
                }),
            });

            const data = await response.json();
            console.log(data);

            clearInterval(typingAnimation); // Stop animation
            typingIndicator.remove(); // Remove the typing indicator

            if (data.candidates && data.candidates.length > 0) {
                const botMessage = data.candidates[0].content.parts[0].text;
                appendMessage("bot", botMessage);
            } else {
                appendMessage("bot", "Sorry, I couldn't understand that.");
            }
        } catch (error) {
            console.error("Error fetching bot response:", error);
            clearInterval(typingAnimation);
            typingIndicator.remove();
            appendMessage("bot", "Sorry, something went wrong. Please try again.");
        }
    }
});
