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
            defaultValue : "https://static.wixstatic.com/media/8fa7e6_09cf11c3e4584b259145ecc0b2633997.jpg/v1/fill/w_224,h_224,al_c,lg_1,q_80/8fa7e6_09cf11c3e4584b259145ecc0b2633997.webp"
        },
        
    }, {});

    User.associate = models => {
        User.hasMany(models.Children, {foreignKey : 'userId'})
        User.hasMany(models.Demand, {foreignKey : 'userId'})
    }
    
    return User;
}
