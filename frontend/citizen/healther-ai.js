const API_URL = "https://healtherai.base44.app/api/apps/69a87698408c65d44e827704/entities/HealthConversation";

const API_KEY = "e035094ca2254806948d390a83a9571b";

async function sendMessage(){

const input = document.getElementById("messageInput");

const message = input.value;

if(!message) return;

addMessage(message,"user");

input.value="";

// Show loading state
addMessage("Thinking...","ai");

try{

const response = await fetch(API_URL,{
method:"POST",
headers:{
"api_key":API_KEY,
"Content-Type":"application/json"
},
body:JSON.stringify({
title:"User Message",
module:"chat",
language:"en",
conversation_id:"healther1",
message:message
})
});

if(!response.ok){
throw new Error(`HTTP error! status: ${response.status}`);
}

const data = await response.json();

const aiReply = data.reply || data.message || "AI responded";

// Remove loading message and add AI response
const chatContainer = document.getElementById("chat");
const loadingMessages = chatContainer.querySelectorAll('.message');
if(loadingMessages.length > 0){
    const lastMessage = loadingMessages[loadingMessages.length - 1];
    if(lastMessage && lastMessage.textContent === "Thinking..."){
        lastMessage.remove();
    }
}

addMessage(aiReply,"ai");

}catch(error){

console.error('Healther AI Error:', error);

// Remove loading message and add error
const chatContainer = document.getElementById("chat");
const loadingMessages = chatContainer.querySelectorAll('.message');
if(loadingMessages.length > 0){
    const lastMessage = loadingMessages[loadingMessages.length - 1];
    if(lastMessage && lastMessage.textContent === "Thinking..."){
        lastMessage.remove();
    }
}

addMessage("Error: Unable to connect to Healther AI. Please try again.","ai");
}

}

function addMessage(text,type){

const chat = document.getElementById("chat");

const div = document.createElement("div");

div.className="message "+type;

div.innerText=text;

chat.appendChild(div);

chat.scrollTop = chat.scrollHeight;

}
