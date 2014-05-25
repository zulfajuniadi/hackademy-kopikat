Classes = new Meteor.Collection('Classes');
Chats = new Meteor.Collection('Chats');
Attendees = new Meteor.Collection('Attendees');

Meteor.Collection.prototype.nuke = function() {

  console.log(this);
  var that = this;
  this.find().fetch().forEach(function(item){
    that.remove(item._id)
  })
}

