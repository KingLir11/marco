
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Compass } from "lucide-react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Ask me anything about your trip 🌤️" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages([...messages, { type: "user", text: input }]);
    
    // Simulate bot response
    setTimeout(() => {
      let response = "I'm here to help with your trip planning! What would you like to know?";
      
      // Simple pattern matching
      if (input.toLowerCase().includes("weather")) {
        response = "I can help you plan around the weather forecast. Try planning a trip to see detailed weather information for your destination!";
      } else if (input.toLowerCase().includes("equipment") || input.toLowerCase().includes("gear")) {
        response = "Based on your destination and the weather forecast, I'll recommend what to pack for your trip.";
      } else if (input.toLowerCase().includes("alternative") || input.toLowerCase().includes("rain")) {
        response = "Don't worry about bad weather! I always provide alternative plans for rainy days or sudden weather changes.";
      }
      
      setMessages(prevMessages => [...prevMessages, { type: "bot", text: response }]);
    }, 1000);
    
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 mb-4 overflow-hidden border">
          <div className="bg-primary p-4 text-white">
            <h3 className="font-medium">Trip Assistant</h3>
          </div>
          
          <div className="h-80 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  message.type === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                    message.type === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t p-4 flex">
            <Input
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 mr-2"
            />
            <Button onClick={sendMessage} size="sm" className="bg-primary hover:bg-primary/90">
              Send
            </Button>
          </div>
        </div>
      )}
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-full shadow-lg"
      >
        <Compass className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ChatBot;
