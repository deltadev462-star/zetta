import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Fab,
  Badge,
  Fade,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Chat,
  Send,
  Close,
  Support,
  Person,
  MoreVert,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: "customer" | "support";
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatSession {
  id: string;
  customer_id: string;
  customer_name: string;
  support_agent_id?: string;
  support_agent_name?: string;
  status: "waiting" | "active" | "closed";
  created_at: string;
  updated_at: string;
}

const LiveChat: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSupport = user?.role === "admin";

  useEffect(() => {
    if (isOpen && user) {
      initializeChat();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    setLoading(true);
    try {
      // For customers, create or get existing chat session
      if (!isSupport) {
        const { data: existingSession } = await supabase
          .from("chat_sessions")
          .select("*")
          .eq("customer_id", user?.id)
          .eq("status", "active")
          .single();

        if (existingSession) {
          setChatSession(existingSession);
          await loadMessages(existingSession.id);
        } else {
          // Create new chat session
          const { data: newSession, error } = await supabase
            .from("chat_sessions")
            .insert({
              customer_id: user?.id,
              customer_name:
                user?.profile?.full_name ||
                user?.email ||
                t("liveChat.customer"),
              status: "waiting",
            })
            .select()
            .single();

          if (!error && newSession) {
            setChatSession(newSession);
            // Send welcome message
            const welcomeMessage: Message = {
              id: Date.now().toString(),
              sender_id: "system",
              sender_name: t("liveChat.system"),
              sender_type: "support",
              content: t("liveChat.welcomeMessage"),
              timestamp: new Date().toISOString(),
              read: true,
            };
            setMessages([welcomeMessage]);
          }
        }
      } else {
        // For support agents, show active sessions
        // This would be implemented in a separate admin interface
        console.log("Support agent view");
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true });

      if (!error && data) {
        setMessages(data);
        // Mark messages as read
        if (!isSupport) {
          await supabase
            .from("chat_messages")
            .update({ read: true })
            .eq("session_id", sessionId)
            .eq("sender_type", "support");
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !chatSession) return;

    const newMessage: Omit<Message, "id"> = {
      sender_id: user?.id || "",
      sender_name:
        user?.profile?.full_name || user?.email || t("liveChat.user"),
      sender_type: isSupport ? "support" : "customer",
      content: currentMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Optimistically add message to UI
    const tempId = Date.now().toString();
    setMessages((prev) => [...prev, { ...newMessage, id: tempId }]);
    setCurrentMessage("");

    try {
      // Send message to database
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          ...newMessage,
          session_id: chatSession.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update message with real ID
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? data : msg))
      );

      // Simulate support response after 3 seconds (for demo)
      if (!isSupport && messages.length < 5) {
        setTimeout(() => {
          simulateSupportResponse();
        }, 3000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  const simulateSupportResponse = () => {
    const responses = [
      t("liveChat.responses.greeting"),
      t("liveChat.responses.understanding"),
      t("liveChat.responses.moreDetails"),
      t("liveChat.responses.checkingForYou"),
      t("liveChat.responses.anythingElse"),
    ];

    const response: Message = {
      id: Date.now().toString(),
      sender_id: "support-agent",
      sender_name: t("liveChat.supportAgent"),
      sender_type: "support",
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, response]);
    setUnreadCount((prev) => prev + 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const locale =
      i18n.language === "ar"
        ? "ar-SA"
        : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";
    return date.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) {
    return (
      <Fab
        color="primary"
        aria-label={t("ariaLabels.openChat")}
        onClick={() => setIsOpen(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "linear-gradient(135deg, #00d4ff 0%, #0066CC 100%)",
          boxShadow: "0 8px 32px rgba(0,212,255,0.4)",
          zIndex: 9999,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "scale(1.1) rotate(10deg)",
            boxShadow: "0 12px 40px rgba(0,212,255,0.6)",
            background: "linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              background: "#ff0080",
              boxShadow: "0 0 10px rgba(255,0,128,0.5)",
            },
          }}
        >
          <Chat sx={{ fontSize: 28 }} />
        </Badge>
      </Fab>
    );
  }

  return (
    <Fade in={isOpen}>
      <Paper
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 380,
          height: 600,
          display: "flex",
          flexDirection: "column",
          bgcolor: "rgba(15,15,25,0.98)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7), 0 0 80px rgba(0,212,255,0.2)",
          borderRadius: 1,
          overflow: "hidden",
          zIndex: 10000,
          animation: "slideInUp 0.3s ease-out",
          "@keyframes slideInUp": {
            "0%": {
              transform: "translateY(100px)",
              opacity: 0,
            },
            "100%": {
              transform: "translateY(0)",
              opacity: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #0066CC 0%, #00d4ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,212,255,0.3)",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #00d4ff, transparent)",
              animation: "shimmer 2s infinite",
            },
            "@keyframes shimmer": {
              "0%": { opacity: 0.5 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.5 },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <Support sx={{ color: "white", fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {t("liveChat.title")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#00ff88",
                    boxShadow: "0 0 10px #00ff88",
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.5 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {chatSession?.status === "active"
                    ? t("liveChat.online")
                    : t("liveChat.respondShortly")}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setIsOpen(false);
              setUnreadCount(0);
            }}
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
                transform: "rotate(90deg)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "rgba(0,212,255,0.05)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "rgba(0,212,255,0.3)",
              borderRadius: "4px",
              "&:hover": {
                bgcolor: "rgba(0,212,255,0.5)",
              },
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {messages.map((message) => {
                const isCustomer = message.sender_type === "customer";
                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      justifyContent: isCustomer ? "flex-end" : "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: isCustomer ? "row-reverse" : "row",
                        gap: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: isCustomer ? "#0066CC" : "#00d4ff",
                          border: "2px solid",
                          borderColor: isCustomer
                            ? "rgba(0,102,204,0.3)"
                            : "rgba(0,212,255,0.3)",
                          boxShadow: isCustomer
                            ? "0 0 20px rgba(0,102,204,0.3)"
                            : "0 0 20px rgba(0,212,255,0.3)",
                        }}
                      >
                        {isCustomer ? (
                          <Person sx={{ fontSize: 20 }} />
                        ) : (
                          <Support sx={{ fontSize: 20 }} />
                        )}
                      </Avatar>
                      <Box>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: isCustomer
                              ? "rgba(0,102,204,0.15)"
                              : "rgba(0,212,255,0.15)",
                            border: "1px solid",
                            borderColor: isCustomer
                              ? "rgba(0,102,204,0.3)"
                              : "rgba(0,212,255,0.3)",
                            borderRadius: isCustomer
                              ? "8px 8px 4px 8px"
                              : "8px 8px 8px 4px",
                            boxShadow: isCustomer
                              ? "0 4px 12px rgba(0,102,204,0.1)"
                              : "0 4px 12px rgba(0,212,255,0.1)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: isCustomer
                                ? "0 6px 20px rgba(0,102,204,0.2)"
                                : "0 6px 20px rgba(0,212,255,0.2)",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "white",
                              lineHeight: 1.6,
                            }}
                          >
                            {message.content}
                          </Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.5)",
                            display: "block",
                            mt: 0.5,
                            px: 1,
                            textAlign: isCustomer ? "right" : "left",
                            fontSize: "0.7rem",
                          }}
                        >
                          {getMessageTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(0,212,255,0.2)" }} />

        {/* Input */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 1,
            alignItems: "flex-end",
            bgcolor: "rgba(0,212,255,0.05)",
            borderTop: "1px solid rgba(0,212,255,0.2)",
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder={t("liveChat.placeholder")}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.05)",
                "& fieldset": {
                  borderColor: "rgba(0,212,255,0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0,212,255,0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00d4ff",
                  boxShadow: "0 0 0 2px rgba(0,212,255,0.1)",
                },
              },
              "& .MuiInputBase-input": {
                color: "white",
                "&::placeholder": {
                  color: "rgba(255,255,255,0.5)",
                  opacity: 1,
                },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={!currentMessage.trim()}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "rgba(0,212,255,0.2)",
              border: "1px solid rgba(0,212,255,0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(0,212,255,0.3)",
                border: "1px solid rgba(0,212,255,0.5)",
                transform: "scale(1.05)",
                boxShadow: "0 0 20px rgba(0,212,255,0.4)",
              },
              "&:disabled": {
                opacity: 0.5,
              },
            }}
          >
            <Send sx={{ fontSize: 22, color: "#00d4ff" }} />
          </IconButton>
        </Box>
      </Paper>
    </Fade>
  );
};

export default LiveChat;
