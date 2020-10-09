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

        contactedParentId : {
            type : DataTypes.INTEGER                   
        },

    }, {});

    Demand.associate = models => {
        Demand.belongsTo(models.User, {foreignKey : 'userId'})
    }
    
    return Demand;
}
