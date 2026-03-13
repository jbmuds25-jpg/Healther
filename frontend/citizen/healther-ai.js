const API_URL = "https://healtherai.base44.app/api/apps/69a87698408c65d44e827704/entities/HealthConversation";

const API_KEY = "e035094ca2254806948d390a83a9571b";

async function sendMessage(){

const input = document.getElementById("messageInput");

const message = input.value;

if(!message) return;

addMessage(message,"user");

input.value="";

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

const data = await response.json();

const aiReply = data.reply || "AI responded";

addMessage(aiReply,"ai");

}catch(error){

addMessage("Error contacting Healther AI","ai");

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
