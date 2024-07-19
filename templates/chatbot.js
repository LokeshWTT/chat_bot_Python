document.addEventListener('DOMContentLoaded', function() {
    // Create and append the CSS for the selected department and grid view
    const style = document.createElement('style');
    style.textContent = `
        .selected-department {
            background-color: #007bff;
            color: white; /* Set text color to white when selected */
        }
        .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr); /* Ensure two columns per row */
            gap: 10px;
            padding: 10px;
        }
        .grid-item {
            cursor: pointer;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            border: 1px solid #007bff;
        }
        .grid-item:hover {
            background-color: #e0e0e0;
            color: black;
            border: 1px solid black;
        }
    `;
    document.head.appendChild(style);

    createChatWidget();
});

function createChatWidget() {
    const chatIcon = document.createElement('div');
    chatIcon.id = 'chatIcon';
    chatIcon.className = 'chatIcon';
    chatIcon.innerHTML = '<img src="/assets/faq_chatgpt/images/robot.png" alt="Chat Icon" width="30">';
    chatIcon.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background-color: #007bff;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        color: #fff;
        font-size: 24px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    `;
    document.body.appendChild(chatIcon);

    const chatContainer = document.createElement('div');
    chatContainer.id = 'chatContainer';
    chatContainer.className = 'chatContainer';
    chatContainer.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 360px;
        height: 500px;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        overflow: hidden;
        background-color: #fff;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-family: Arial, sans-serif;
        display: none; /* Initially hide the chat container */
    `;
    document.body.appendChild(chatContainer);

    const chatHeader = document.createElement('div');
    chatHeader.id = 'chatHeader';
    chatHeader.className = 'chatHeader';
    chatHeader.style.cssText = `
        background-color: #007bff;
        color: #fff;
        padding: 16px;
        font-size: 20px;
        text-align: center;
        border-bottom: 2px solid #007bff;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    chatContainer.appendChild(chatHeader);

    const logo = document.createElement('img');
    logo.src = '/assets/faq_chatgpt/images/chatbot-icon-.webp';
    logo.alt = 'Chat Icon';
    logo.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 50px;
        cursor: pointer; /* Add cursor pointer for interaction */
    `;
    chatHeader.appendChild(logo);

    const headerText = document.createElement('span');
    headerText.textContent = 'WTT - FAQ Chat Bot';
    headerText.style.marginRight = '48px';
    chatHeader.appendChild(headerText);

    const closeIcon = document.createElement('span');
    closeIcon.id = 'closeIcon';
    closeIcon.className = 'closeIcon';
    closeIcon.innerHTML = '&times;';
    closeIcon.style.cssText = `
        position: absolute;
        top: 12px;
        right: 16px;
        cursor: pointer;
        font-size: 24px;
    `;
    chatHeader.appendChild(closeIcon);

    closeIcon.addEventListener('click', function() {
        chatContainer.style.display = 'none';
        chatIcon.style.display = 'flex';
    });

    const chatMessages = document.createElement('div');
    chatMessages.id = 'chatMessages';
    chatMessages.className = 'chatMessages';
    chatMessages.style.cssText = `
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background-color: #f9f9f9;
        font-size: 14px;
    `;
    chatContainer.appendChild(chatMessages);

    const chatInputContainer = document.createElement('div');
    chatInputContainer.id = 'chatInputContainer';
    chatInputContainer.className = 'chatInputContainer';
    chatInputContainer.style.cssText = `
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: #f1f1f1;
        border-top: 1px solid #ddd;
    `;
    chatContainer.appendChild(chatInputContainer);

    const userInput = document.createElement('input');
    userInput.id = 'userInput';
    userInput.className = 'userInput';
    userInput.type = 'text';
    userInput.placeholder = 'Type your question...';
    userInput.style.cssText = `
        flex: 1;
        border: none;
        outline: none;
        padding: 10px;
        font-size: 14px;
        border-radius: 6px;
        background-color: #fff;
        color: #000;
    `;
    chatInputContainer.appendChild(userInput);

    const sendButton = document.createElement('button');
    sendButton.id = 'sendButton';
    sendButton.className = 'sendButton';
    sendButton.textContent = 'Send';
    sendButton.style.cssText = `
        background-color: #007bff;
        color: #fff;
        border: none;
        padding: 10px 20px;
        margin-left: 10px;
        cursor: pointer;
        border-radius: 6px;
        transition: background-color 0.3s ease;
        font-size: 14px;
    `;
    chatInputContainer.appendChild(sendButton);

    chatIcon.addEventListener('click', function() {
        chatContainer.style.display = 'flex';
        chatIcon.style.display = 'none';
    });

    closeIcon.addEventListener('click', function() {
        chatContainer.style.display = 'none';
        chatIcon.style.display = 'flex';
    });

    sendButton.addEventListener('click', function() {
        sendMessage();
    });

    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    logo.addEventListener('click', function() {
        // Scroll to the top of the chatMessages container
        chatMessages.scrollTop = 0;
    });

    // Function to fetch user information and initialize chat
    function initializeChat() {
        getUserInfo().then(userName => {
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'bot-message';
            welcomeMessage.innerHTML = `Welcome, ${userName}! How can I assist you today?`;
            welcomeMessage.style.cssText = `
                align-self: flex-start;
                background-color: #f0f0f0;
                padding: 10px;
                max-width: 70%;
                border-radius: 10px;
                word-wrap: break-word;
                margin-top: 10px; // Add space above the welcome message
            `;
            chatMessages.appendChild(welcomeMessage);
                // Function to fetch departments from API
                async function fetchDepartments() {
                    const url = 'http://10.15.5.191:5454/api/method/faq_chatgpt.departmentwise.call_department';

                    try {
                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error('Failed to fetch departments');
                        }
                        const data = await response.json();
                        const departments = new Set(data.data.map(item => item.parent));
                        return Array.from(departments);
                    } catch (error) {
                        console.error('Error fetching departments:', error);
                        return [];
                    }
                }

            fetchDepartments().then(departments => {
                if (departments.length > 0) {
                    const departmentSection = document.createElement('div');
                    departmentSection.className = 'bot-message';
                    departmentSection.innerHTML = 'Choose Department:';
                    departmentSection.style.cssText = `
                        align-self: flex-start;
                        background-color: #f0f0f0;
                        padding: 10px;
                        max-width: 70%;
                        border-radius: 10px;
                        word-wrap: break-word;
                        margin-top: 10px; // Add space between messages
                    `;
                    chatMessages.appendChild(departmentSection);

                    const gridContainer = document.createElement('div');
                    gridContainer.className = 'grid-container';
                    chatMessages.appendChild(gridContainer);

                    let selectedDepartmentElement = null;

                    departments.forEach((dept, index) => {
                        const deptOption = document.createElement('div');
                        deptOption.className = 'grid-item';
                        deptOption.textContent = `${index + 1}) ${dept}`;
                        deptOption.addEventListener('click', () => {
                            if (selectedDepartmentElement) {
                                selectedDepartmentElement.classList.remove('selected-department');
                            }
                            selectedDepartmentElement = deptOption;
                            deptOption.classList.add('selected-department');

                            selectedDepartment = dept;
                            console.log(`Selected department: ${selectedDepartment}`);
                            sendMessage();
                        });
                        gridContainer.appendChild(deptOption);
                    });

                    chatMessages.scrollTop = chatMessages.scrollHeight;
                } else {
                    console.error('No departments fetched.');
                }
            }).catch(error => {
                console.error('Error fetching departments:', error);
            });

        }).catch(error => {
            console.error('Error getting user info:', error);
        });
    }

    // Call the function to initialize the chat
    initializeChat();
}


// Function to fetch user info from Frappe
function getUserInfo() {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: 'frappe.auth.get_logged_user',
            callback: function(response) {
                if (response.message) {
                    resolve(response.message);
                } else {
                    reject('User information not available');
                }
            },
            error: function(xhr, textStatus, error) {
                console.error('Error fetching user info:', error);
                reject(error);
            }
        });
    });
}

function get_full_name(data) {
    // Assuming data structure is similar to your provided example
    for (let entry of data) {
        if (entry['Full Name']) {
            return entry['Full Name'];
        }
    }
    return null; // Return null if full name not found
}

// Example usage:
getUserInfo()
    .then(data => {
        let fullName = get_full_name(data);
        console.log('Full Name:', fullName);
        // Use fullName as needed
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error
    });


function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


let isFetching = false; // Flag to prevent multiple concurrent fetches

function sendMessage() {
    const userQuestion = userInput.value.trim();

    if (userQuestion !== '' && !isFetching) { // Check if there is a question and fetching is not in progress
        isFetching = true; // Set fetching flag to true

        // Append user's message to UI
        appendUserMessage(userQuestion);

        // Fetch answer dynamically and handle the response
        handleResponse(userQuestion, selectedDepartment)
            .then(allAnswers => {
                // Save user question and answer to backend using frappe.call
                frappe.call({
                    method: 'faq_chatgpt.user_question.save_question',
                    args: {
                        question: userQuestion,
                        answer: allAnswers,  // Pass all concatenated answers
                    },
                    callback: function(response) {
                        console.log('Question and Answer saved successfully:', response);
                        // Handle response from backend if needed
                    },
                    error: function(xhr, textStatus, error) {
                        console.error('Error saving question and answer:', error);
                        appendBotMessage("I'm sorry, I encountered an error. Please try again later.");
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching answer:', error);
                appendBotMessage("I'm sorry, I encountered an error fetching the answer.");
            })
            .finally(() => {
                isFetching = false; // Reset fetching flag
            });

        userInput.value = ''; // Clear input field after sending
    }
}




// Function to append user's message to the chat
function appendUserMessage(message) {
    getUserInfo().then(userName => {
        const messageTime = getCurrentTime(); // Get current time
        const messageElement = document.createElement('div');
        messageElement.className = 'user-message';
        messageElement.textContent = message; // Include only the message content
        messageElement.style.cssText = `
            background-color: #007bff;
            color: #fff;
            padding: 10px;
            max-width: 70%;
            border-radius: 10px;
            word-wrap: break-word;
            margin-top: 8px;
            margin-left: auto;
            position: relative; /* Ensure position is relative for absolute positioning */
        `;
        chatMessages.appendChild(messageElement);

        const userInfoElement = document.createElement('div');
        userInfoElement.className = 'user-info';
        userInfoElement.textContent = `${userName}`; // Display username
        userInfoElement.style.cssText = `
            color: rgb(0, 123, 255);
            font-size: 10px;
            text-align: right;
            margin-bottom: 8px; /* Adjust margin for spacing */
        `;
        chatMessages.appendChild(userInfoElement); // Append username element

        const timeElement = document.createElement('div');
        timeElement.className = 'user-time';
        timeElement.textContent = `${messageTime}`; // Display timestamp
        timeElement.style.cssText = `
            color: rgb(255, 255, 255);
            font-size: 7px;
            text-align: right;
            position: absolute;
            bottom: 2px;
            right: 7px; /* Adjust right position */
        `;
        messageElement.appendChild(timeElement); // Append timestamp inside the message element

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }).catch(error => {
        console.error('Error getting user info:', error);
        const messageElement = document.createElement('div');
        messageElement.className = 'user-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            background-color: #007bff;
            color: #fff;
            padding: 10px;
            max-width: 70%;
            border-radius: 10px;
            word-wrap: break-word;
            margin-bottom: 4px;
            margin-left: auto;
        `;
        chatMessages.appendChild(messageElement);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Modified appendBotMessage function to include owner
function appendBotMessage(message, owner) {
    const messageTime = getCurrentTime(); // Get current time
    const messageElement = document.createElement('div');
    messageElement.className = 'bot-message';
    messageElement.innerHTML = message;
    messageElement.style.cssText = `
       align-self: flex-start;
       background-color: #f0f0f0;
       padding: 10px;
       max-width: 70%;
       border-radius: 10px;
       word-wrap: break-word;
       position: relative; /* Ensure relative position for absolute children */
    `;
    chatMessages.appendChild(messageElement);

    // Append owner information if available
    if (owner) {
        const ownerElement = document.createElement('div');
        ownerElement.className = 'bot-owner';
        messageElement.appendChild(ownerElement);
    }

    const timeElement = document.createElement('div');
    timeElement.className = 'bot-time';
    if(owner == undefined)
        {
            timeElement.textContent = `${messageTime} `;
        }
        else{
            timeElement.textContent = `- ${owner} ${messageTime} `; // Display timestamp for bot message
        }
    timeElement.style.cssText = `
        color: rgb(0, 123, 255);
        font-size: 10px;
        text-align: right;
        margin-bottom: 14px
        position: absolute;
        bottom: -10px;
        right: 10px;
    `;
    messageElement.appendChild(timeElement); // Append timestamp inside the bot message element

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


const apiUrl = "http://10.15.5.191:5454/api/method/faq_chatgpt.departmentwise.call_department";

// Fetch FAQ data from the API
// Modify fetchFaqData function to accept department parameter and filter FAQs
let selectedDepartment = null;

async function fetchFaqData(department) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (department) {
            return result.data.filter(faq => faq.parent === department);
        }
        return result.data; // Assuming the API returns data in { data: [...] } format
    } catch (error) {
        console.error('Error fetching FAQ data:', error);
        return [];
    }
}

// List of common stop words to be filtered out
const stopWords = new Set(["is", "was", "this", "where", "what", "the", "in", "on", "an", "and", "are",
     "for", "to", "it", "you", "that", "from", "at", "as",
    "by", "or", "if", "but", "not", "they", "we", "of", "which", "have",
    "your", "has", "do", "will", "can", "their", "about", "when", "how",
    "who", "where", "why", "there"]);

// Function to tokenize a string and filter out stop words
function tokenize(text) {
    return text
        .toLowerCase()
        .match(/\b\w+\b/g)

        .filter(token => !stopWords.has(token));
}

// Function to calculate cosine similarity between two tokenized texts
function cosineSimilarity(tokens1, tokens2) {
    const tokenSet1 = new Set(tokens1);
    const tokenSet2 = new Set(tokens2);

    const intersection = [...tokenSet1].filter(token => tokenSet2.has(token));
    const similarity = intersection.length / Math.sqrt(tokenSet1.size * tokenSet2.size);

    return similarity;
}

// Modify getResponse function to accept department parameter
async function getResponse(question, department) {
    const faqData = await fetchFaqData(department);
    let bestMatches = [];
    const questionTokens = tokenize(question);

    // Loop through faqData to find best matches
    for (const item of faqData) {
        const keyTokens = tokenize(item.question);
        const similarity = cosineSimilarity(questionTokens, keyTokens);

        // Only include matches with similarity >= 0.2 (20%)
        if (similarity >= 0.2) {
            bestMatches.push({ question: item.question, answer: item.answer, owner: item.owner, similarity: similarity });
        }
    }

    // Sort best matches by similarity score in descending order
    bestMatches.sort((a, b) => b.similarity - a.similarity);

    return bestMatches;
}

// Function to handle user's question and display appropriate response
async function handleResponse(userQuestion, department) {
    const matches = await getResponse(userQuestion, department);

    // Concatenate all answers into a single string
    const allAnswers = matches.map(match => match.answer).join(' || ');

    // Check for exact match
    const exactMatch = matches.find(match => match.question.toLowerCase() === userQuestion.toLowerCase());

    if (exactMatch) {
        // Exact match found
        appendBotMessage(exactMatch.answer, exactMatch.owner); // Show direct answer
        return allAnswers;  // Return all answers for further use
    } else if (matches.length === 1) {
        // One partial match found
        displaySuggestedQuestions(matches); // Show suggested questions
        return allAnswers;  // Return all answers for further use
    } else if (matches.length > 1) {
        // Multiple partial matches found
        displaySuggestedQuestions(matches); // Show suggested questions
        return allAnswers;  // Return all answers for further use
    } else {
        // No matches found
        appendBotMessage("I'm sorry, I don't have an answer to that question. Please check the official WTT website for more information.");
        return "No answer found";
    }
}

// Function to display suggested questions to the user
// Function to display suggested questions to the user
function displaySuggestedQuestions(matches) {
    const messageElement = document.createElement('div');
    messageElement.className = 'bot-message';
    messageElement.innerHTML = 'I found several similar questions. Please choose the one that best matches your query:';
    messageElement.style.cssText = `
        align-self: flex-start;
        background-color: #f0f0f0;
        padding: 10px;
        max-width: 70%;
        border-radius: 10px;
        word-wrap: break-word;
    `;
    chatMessages.appendChild(messageElement);

    matches.forEach((match, index) => {
        const suggestionText = match.question.toLowerCase();

        // Tokenize suggestion text
        const suggestionTokens = tokenize(suggestionText);

        // Check if all tokens are stop words
        const allStopWords = suggestionTokens.every(token => stopWords.has(token));

        if (!allStopWords) {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.textContent = `${index + 1}. ${match.question}`;
            suggestionElement.style.cssText = `
                cursor: pointer;
                color: #007bff;
                padding: 5px;
                border-radius: 5px;
                margin-top: 5px;
            `;
            suggestionElement.addEventListener('click', async () => {
                // Append user's message to UI
                appendUserMessage(match.question);

                // Append bot's answer
                setTimeout(() => {
                    appendBotMessage(match.answer, match.owner); // Pass owner to appendBotMessage
                }, 100); // Adding a slight delay to ensure proper order
            });
            chatMessages.appendChild(suggestionElement);
        }
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}
