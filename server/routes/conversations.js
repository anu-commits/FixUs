const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Start a new conversation
router.post('/start', async (req, res) => {
  try {
    const { userName, userEmail, phone, relationshipType, initialMessage, urgencyLevel } = req.body;

    // Create or find user
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = new User({
        name: userName,
        email: userEmail,
        phone: phone || ''
      });
      await user.save();
    }

    // Create new conversation
    const conversation = new Conversation({
      userId: user._id.toString(),
      userName,
      userEmail,
      relationshipType,
      urgencyLevel: urgencyLevel || 'medium',
      messages: [{
        sender: 'user',
        content: initialMessage,
        timestamp: new Date()
      }]
    });

    await conversation.save();

    // Add conversation to user's list
    user.conversationIds.push(conversation._id);
    await user.save();

    // Send automated coach response
    const coachResponse = getAutomatedResponse(relationshipType, urgencyLevel);
    conversation.messages.push({
      sender: 'coach',
      content: coachResponse,
      timestamp: new Date()
    });
    await conversation.save();

    res.status(201).json({
      success: true,
      conversationId: conversation._id,
      message: 'Conversation started successfully'
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation'
    });
  }
});

// Send a message
router.post('/:id/messages', async (req, res) => {
  try {
    const { content } = req.body;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Add user message
    conversation.messages.push({
      sender: 'user',
      content,
      timestamp: new Date()
    });

    // Add automated coach response
    const coachResponse = getContextualResponse(content, conversation.relationshipType);
    conversation.messages.push({
      sender: 'coach',
      content: coachResponse,
      timestamp: new Date()
    });

    await conversation.save();

    res.json({
      success: true,
      messages: conversation.messages.slice(-2) // Return the last 2 messages
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Get conversation messages
router.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// Helper function for automated responses
function getAutomatedResponse(relationshipType, urgencyLevel) {
  const responses = {
    romantic: {
      high: "I understand you're going through a really tough time with your partner right now. 💕 That takes courage to reach out. I'm here to help you work through this step by step. Can you tell me more about what's been happening recently?",
      medium: "Thank you for sharing about your relationship situation. 💝 Every relationship has its challenges, and I'm here to help you navigate through this. What would you say has been the biggest issue you're facing together?",
      low: "It's wonderful that you're being proactive about your relationship! 🌟 Even small improvements can make a big difference. What aspects of your relationship would you most like to strengthen?"
    },
    family: {
      high: "Family conflicts can be incredibly painful, and I can hear that this is really affecting you. 🤗 You're not alone in this. Let's work together to find a path forward. What's the most pressing issue you're dealing with right now?",
      medium: "Thank you for trusting me with your family situation. 👨‍👩‍👧‍👦 Family relationships are so important, and it's great that you want to improve things. Can you help me understand the main challenges you're facing?",
      low: "It's beautiful that you want to strengthen your family bonds! 💛 Family relationships are worth investing in. What changes would make the biggest positive impact for everyone involved?"
    },
    friendship: {
      high: "Losing or struggling with friendships can be really isolating and painful. 🫂 I'm glad you reached out for support. True friendships are worth fighting for. What's been happening that's made this feel so urgent?",
      medium: "Friendship challenges can be tricky to navigate. 👯‍♀️ I'm here to help you work through whatever is going on. Can you share more about what's been troubling you about this friendship?",
      low: "It's great that you want to invest in your friendships! 🌟 Good friends make life so much richer. What would you like to see improve or grow in your friendships?"
    }
  };

  return responses[relationshipType]?.[urgencyLevel] || "Thank you for reaching out. I'm here to help you work through whatever relationship challenges you're facing. Can you tell me more about what's been on your mind?";
}

function getContextualResponse(message, relationshipType) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('fight') || lowerMessage.includes('argue')) {
    return "Arguments can be so draining and hurtful. 😔 It sounds like communication has become a real challenge. One thing that often helps is learning to pause before reacting and really trying to understand what the other person is feeling underneath their words. Have you noticed any patterns in what tends to trigger these fights?";
  }
  
  if (lowerMessage.includes('trust') || lowerMessage.includes('lying') || lowerMessage.includes('cheating')) {
    return "Trust issues cut so deep, and rebuilding trust takes time and consistency from both people. 💔 It's understandable that you're feeling hurt and uncertain. The first step is often having an honest conversation about what happened and what each person needs to feel secure again. How are you feeling about having those difficult conversations?";
  }
  
  if (lowerMessage.includes('distance') || lowerMessage.includes('growing apart') || lowerMessage.includes('disconnect')) {
    return "That feeling of growing apart can be so lonely, even when you're still in each other's lives. 🌊 Often this happens when life gets busy and we stop making intentional time for connection. Small, consistent efforts to reconnect can make a huge difference. What used to bring you closer together that maybe has fallen by the wayside?";
  }
  
  if (lowerMessage.includes('communication') || lowerMessage.includes('talk') || lowerMessage.includes('listen')) {
    return "Communication really is the foundation of every healthy relationship! 🗣️ Good communication isn't just about talking - it's about feeling heard and understood. One technique that works well is reflecting back what you heard before responding with your own perspective. How do conversations typically go between you two right now?";
  }
  
  // Default responses based on relationship type
  const defaults = {
    romantic: "Relationships take work, but they're so worth it when both people are committed to growing together. 💕 What you're experiencing is more common than you might think. Let's explore some strategies that could help. What would feel like the most important thing to address first?",
    family: "Family dynamics can be complex because there's so much history and emotion involved. 👨‍👩‍👧‍👦 But families can heal and grow stronger together. What you're sharing takes courage. What would it look like if this relationship was working better for everyone?",
    friendship: "Friendships go through seasons, and it's normal for them to need some attention sometimes. 🤝 The fact that you care enough to work on this shows what kind of friend you are. What does this friendship mean to you, and what would you like it to look like moving forward?"
  };
  
  return defaults[relationshipType] || "Thank you for sharing more details. I can hear how much this matters to you. Let's work together to find some positive steps forward. What feels most important to address right now?";
}

module.exports = router;