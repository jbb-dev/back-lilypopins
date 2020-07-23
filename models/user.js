'use strict';

module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User', {

        user_firstname : {
            type: DataTypes.STRING,
            allowNull: false,
            validate : {
                max: 80,
            }    
        },

        user_lastname : {
            type : DataTypes.STRING,
            allowNull: false,
            validate : {
                max : 80,
            }
        },

        user_email : {
            type : DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate : {
                isEmail: true,
                max: 80,
            }
        },

        user_password : {
            type : DataTypes.STRING,
            allowNull: false,
            validate : {
                min : 5,
            }         
        },

        user_biography : {
            type : DataTypes.STRING,
            validate : {
                max : 255,
            }
        },

        user_avatar : {
            type : DataTypes.BLOB,
        },
        
    }, {});
    
    // User.associate = models => {
    //     User.hasOne(models.Rider)
    //     User.hasMany(models.Horse)
    //     User.belongsToMany(models.Horse, {through: 'favorites_horses'})
    // }


    return User;
}
