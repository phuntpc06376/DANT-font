import React, { useState, useEffect } from "react";
import { Client as TwilioChatClient } from "twilio-chat";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ChatApp = () => {
  const [chatClient, setChatClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [currentChannel, setCurrentChannel] = useState(null);

  // Function to fetch Twilio token
  const getToken = async () => {
    try {
      // getProfile
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null; // Giải mã token
      const username = decodedToken?.sub;

      const responseProfile = await axios.get(
        "http://localhost:8080/api/account/getByUsername",
        {
          params: { username },
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );


      const response = await axios.post("http://localhost:8080/twilio/register", {
        userId: "1234m5",//responseProfile.data.id,
        name: "test chat"//responseProfile.data.fullname,
      });
      console.log(response.data);

      return response.data.data;
    } catch (error) {
      console.error("Error fetching Twilio token:", error);
      throw error;
    }
  };

  // Initialize Chat Client
  useEffect(() => {
    // getToken();
    initializeChatClient();
  }, []);

  const initializeChatClient = async () => {
    try {
      const token = await getToken();

      const client = new TwilioChatClient(token);

      client.on('connectionError', (err)=>{
        console.log(err);
      })

      client.on('stateChanged', async (state) => {
        console.log(state)
        if (state === 'initialized') {
          console.log(client)
          client.on("tokenAboutToExpire", async () => {
            try {
              const newToken = await getToken();
              client.updateToken(newToken);
              localStorage.setItem("twilioToken", newToken);
            } catch (error) {
              console.error("Error refreshing token:", error);
            }
          });
          client.on("tokenExpired", async () => {
            try {
              const newToken = await getToken();
              client.updateToken(newToken);
              localStorage.setItem("twilioToken", newToken);
            } catch (error) {
              console.error("Error refreshing token after expiration:", error);
            }
          });

          const channels = await client.getSubscribedChannels();
          console.log(channels);
        }
      })


      // const defaultChannel = channels.items; // Select the first channel or customize logic
      // setCurrentChannel(defaultChannel);

      // setChatClient(client);
    } catch (error) {
      console.error("Error initializing Twilio Chat Client:", error);
    }
  };

  // Fetch initial messages and set up message listener
  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChannel) {
        const messageFetch = await currentChannel.getMessages();
        setMessages(messageFetch.items);
        currentChannel.on("messageAdded", (newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        });
      }
    };

    fetchMessages();

    return () => {
      currentChannel?.removeAllListeners();
    };
  }, [currentChannel]);

  // Send message
  // const sendMessage = async () => {
  //   if (messageText.trim() && currentChannel) {
  //     try {
  //       await currentChannel.sendMessage(messageText, {
  //         id: profile?.username,
  //         uid: profile?.id,
  //         name: profile?.name,
  //       });
  //       setMessageText("");
  //     } catch (error) {
  //       console.error("Error sending message:", error);
  //     }
  //   }
  // };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.index} className="message">
            <strong>{msg.author}:</strong> {msg.body}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
        />
        {/* <button onClick={sendMessage}>Send</button> */}
      </div>
    </div>
  );
};

export default ChatApp;
