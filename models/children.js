'use strict';

module.exports = (sequelize, DataTypes) => {

    const Children = sequelize.define('Children', {

        sex : {
            type: DataTypes.STRING,           
        },
        
        firstname : {
            type: DataTypes.STRING,
        },

        age : {
            type : DataTypes.STRING,
        },

        section : {
            type : DataTypes.STRING,
        },
        
        biography : {
            type : DataTypes.STRING,
        },

        avatar : {
            type : DataTypes.STRING,
        },

    }, {});

    Children.associate = models => {
        Children.belongsTo(models.User, {foreignKey : 'userId'})
    }
    
    return Children;
}