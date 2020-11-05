'use strict';

module.exports = (sequelize, DataTypes) => {

    const Message = sequelize.define('Message', {
        
        text : {
            type : DataTypes.STRING,
        },

        senderId : {
            type : DataTypes.INTEGER,
        },

        recipientId : {
            type : DataTypes.INTEGER,
        },

        isRead : {
            type : DataTypes.INTEGER,
            defaultValue : 0,
        }

    }, {});

    Message.associate = models => {
        Message.belongsTo(models.Conversation)
    }

    return Message;
}