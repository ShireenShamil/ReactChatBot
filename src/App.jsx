import React, { useEffect, useState , useRef } from 'react'
import ChatBotIcon from './components/ChatBotIcon'
import ChatForm from './components/ChatForm'
import ChatMessage from './components/ChatMessage'
import { companyInfo } from "./companyInfo";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false); 


  const chatBodyRef= useRef();

  const generateBotResponse = async (history) => {

     const  updateHistory = (text , isError= false) => {
      setChatHistory(prev => [...prev.filter(msg=> msg.text !== "Thinking..."), {role: "model", text , isError}])
     };

    // Get the latest user message
    const lastUserMessage = history.filter(msg => msg.role === "user").slice(-1)[0]?.text?.toLowerCase() || "";

    // Check for specific company detail requests
    if (lastUserMessage.includes("email")) {
      updateHistory(`Our email is: ${companyInfo.email}`);
      return;
    }
    if (lastUserMessage.includes("phone") || lastUserMessage.includes("contact number") || lastUserMessage.includes("call")) {
      updateHistory(`Our phone number is: ${companyInfo.phone}`);
      return;
    }
    if (lastUserMessage.includes("address") || lastUserMessage.includes("location") || lastUserMessage.includes("located")) {
      const a = companyInfo.address;
      updateHistory(`Our address is: ${a.line1}, ${a.line2}, ${a.city}, ${a.state} ${a.zip}, ${a.country}`);
      return;
    }
    if (lastUserMessage.includes("name")) {
      updateHistory(`Our company name is: ${companyInfo.name}`);
      return;
    }
    if (lastUserMessage.includes("tagline")) {
      updateHistory(`Our tagline is: ${companyInfo.tagline}`);
      return;
    }
    if (lastUserMessage.includes("description") || lastUserMessage.includes("about") || lastUserMessage.includes("what do you do")) {
      updateHistory(companyInfo.description);
      return;
    }
    if (lastUserMessage.includes("facebook") || lastUserMessage.includes("twitter") || lastUserMessage.includes("instagram") || lastUserMessage.includes("linkedin") || lastUserMessage.includes("github") || lastUserMessage.includes("social")) {
      const s = companyInfo.socialLinks;
      updateHistory(`Social Links:\nFacebook: ${s.facebook}\nTwitter: ${s.twitter}\nInstagram: ${s.instagram}\nLinkedIn: ${s.linkedin}\nGitHub: ${s.github}`);
      return;
    }
    // Fallback to full company info for generic company questions
    const companyKeywords = [
      "company details", "about your company", "about buildify", "company info", "who are you", "what is buildify", "tell me about your company"
    ];
    if (companyKeywords.some(keyword => lastUserMessage.includes(keyword))) {
      // Format company info
      const info = companyInfo;
      const companyDetails = `Company Name: ${info.name}\nTagline: ${info.tagline}\nDescription: ${info.description}\nEmail: ${info.email}\nPhone: ${info.phone}\nAddress: ${info.address.line1}, ${info.address.line2}, ${info.address.city}, ${info.address.state} ${info.address.zip}, ${info.address.country}\nSocial Links: Facebook: ${info.socialLinks.facebook}, Twitter: ${info.socialLinks.twitter}, Instagram: ${info.socialLinks.instagram}, LinkedIn: ${info.socialLinks.linkedin}, GitHub: ${info.socialLinks.github}\n${info.copyright}`;
      updateHistory(companyDetails);
      return;
    }

    history = history.map(({role, text}) => ({role, parts: [{text}]}));
   


    const requestOptions = {
      method: "POST",
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify({contents: history})
    }

   




    try{

      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions );
      const data = await response.json();
      if(!response.ok) throw new Error(data.error.message || "Something went wrong!" );

      // const apiResponseText = data.candidates[0].contents.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
      const apiResponseText =
  data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, "$1").trim() ||
  "Sorry, I couldn't generate a response.";

      updateHistory(apiResponseText);
      console.log(data);
    }catch(error){
      updateHistory(error.message , true);
    }

  };

 

  useEffect(() => {
 chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behavior: "smooth"})
  }, [chatHistory]);
  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>

      <button onClick={() => setShowChatbot(prev => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>
      <div className='chatbot-popup'>

        {/* Chatbot header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatBotIcon />
            <h2 className="logo-text">
              ChatBot
            </h2>
          </div>
     <button className="material-symbols-rounded" onClick={() => setShowChatbot(prev => !prev)} id="chatbot-toggler">
keyboard_arrow_down
</button>

        </div>

 {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
             <ChatBotIcon />
             <p className="message-text">
              Hey there, <br /> How can i help you today?
             </p>

          </div>


           {chatHistory.map((chat , index) => (
            <ChatMessage key={index} chat={chat} />
           ))}
          

        </div>

{/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          generateBotResponse={generateBotResponse}/>
        </div>
      </div>
      
    </div>
  )
}

export default App
