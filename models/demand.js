'use strict';

module.exports = (sequelize, DataTypes) => {

    const Demand = sequelize.define('Demand', {

        status : {
            type : DataTypes.STRING
        },
        beginAt : {
            type : DataTypes.DATE
        },

        endAt : {
            type : DataTypes.DATE           
        },

        senderId : {
            type : DataTypes.INTEGER                   
        },

        contactedParentId : {
            type : DataTypes.INTEGER                   
        },

    }, {});

    Demand.associate = models => {
        Demand.belongsToMany(models.User, { through: 'UserDemand' , foreignKey:'demandId'});
    }
    
    return Demand;
}
