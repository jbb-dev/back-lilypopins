'use strict';

module.exports = (sequelize, DataTypes) => {

    const UserConversation = sequelize.define('UserConversation', {

        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            allowNull : false
        },

    })

    UserConversation.associate = models => {
        }

    return UserConversation ;
}