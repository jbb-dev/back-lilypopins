'use strict';

module.exports = (sequelize, DataTypes) => {

    const UserDemand = sequelize.define('UserDemand', {

        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            allowNull : false
        },


    }, {});

    UserDemand.associate = models => {      
    }
    
    return UserDemand;
}
