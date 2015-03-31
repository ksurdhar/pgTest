var Schema = {
  users: {
    id: {type: 'increments', nullable: false, primary: true},
    email: {type: 'string', maxlength: 254, nullable: false, unique: true},
    name: {type: 'string', maxlength: 150, nullable: false}
  },
  rides: {
    id: {type: 'increments', nullable: false, primary: true},
    destination: {type: 'string', maxlength: 150, nullable: false},
    spacesAvailable: {type: 'integer', nullable: false},
    user_id:{type: 'integer', nullable: false, unsigned: true}
  },
  requests: {
    id: {type: 'increments', nullable: false, primary: true},
    user_id: {type: 'integer', nullable: false, unsigned: true},
    ride_id: {type: 'integer', nullable: false, unsigned: true},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
  }
};
module.exports = Schema;
