'use strict';

module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User', {

        firstname : {
            type: DataTypes.STRING,
        },

        lastname : {
            type : DataTypes.STRING,
        },

        email : {
            type : DataTypes.STRING,
        },

        password : {
            type : DataTypes.STRING,
        },

        biography : {
            type : DataTypes.STRING,
        },

        age : {
            type : DataTypes.STRING,
        },

        postalCode : {
            type : DataTypes.STRING,
        },

        city : {
            type : DataTypes.STRING,   
        },

        availabilities : {
            type : DataTypes.JSON,
        },

        avatar : {
            type : DataTypes.STRING,
        },
        
    }, {});

    User.associate = models => {
        User.hasMany(models.Children, {foreignKey : 'userId'})
    }
    
    return User;
}
