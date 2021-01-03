'use strict';

module.exports = (sequelize, DataTypes) => {

    const Conversation = sequelize.define('Conversation', {
        

        user1 : {
            type : DataTypes.INTEGER,
        },

        user2 : {
            type : DataTypes.INTEGER,
        },

    }, {});

    Conversation.associate = models => {
        Conversation.hasMany(models.Message); 
        Conversation.belongsToMany(models.User, { through: 'UserConversation', foreignKey: 'conversationId' });
    }

    return Conversation;
}