
getUserAvatarUrl = function() {

  var user = Meteor.user();

  if(user) {

    if(user.emails) {
      return "http://www.gravatar.com/avatar/" + md5(user.emails[0].address.trim().toLowerCase()) + "&s=100";
    }
    if(user.services)  {
      if(user.services.google) {
        return user.services.google.picture;
      }
      if(user.services.facebook) {
        return "http://www.gravatar.com/avatar/" + md5(user.services.facebook.email.trim().toLowerCase()) + "&s=100";
      }
    }

  }

  return '';

}

Template.classes.active = function() {
  return Classes.find().fetch();
}

Template.classes.showImport = function() {
  return Meteor.userId();
}

Template.classes.helpers({
  class_url: function() {
    console.log(this)
    if(Meteor.user()) {
      if(Meteor.user()._id  === this.owner) {
        return '/teacher/' + this._id;  
      }
      return '/student/' + this._id;  
    }
    return '';
  },
});

Template.classes.events({
  'click .load': function(e) {
    console.log($(e.target).data());
  },
  'click .wrap': function(e) {
    if(!Meteor.userId()) {
      $('#login-sign-in-link').trigger('click');
      e.preventDefault();
      return false;
    }
  }
})

Template.home.events({
  'click #import' : function() {
    bootbox.confirm($('<iframe id="iframe" src="/importer/index.html?' + Math.random() + '" style="width: 526px;border: 0px;"></iframe>'), function(){});
    var iframe = $('#iframe');
    var iwin = iframe[0].contentWindow;
    var user = Meteor.user();
    var interval = setInterval(function(){
      if(iwin.result) {
        bootbox.hideAll();
        bootbox.prompt('Class Details', function(name){

          var newclass = {
            name: name,
            template: iwin.result,
            gravatar: getUserAvatarUrl(),
            owner: user._id,
            subject: $('.class-subject').val(),
            started: false
          };

          Classes.insert(newclass);

          bootbox.hideAll();

        });
        $('.bootbox-form').append('<select class="class-subject"><option value="History">History</option><option value="Physics">Physics</option><option value="Biology">Biology</option><option value="Chemistry">Chemistry</option></select>')
        $('.bootbox-input-text').attr({placeholder: 'Class Name'});
        clearInterval(interval);

      }
    }, 200);

  }
});

$(document).on('click', '.goback', function(){
  window.history.back();
});

Template.class_layout.helpers({
  videotag: function() {
    // return '<video></video>'
  }
});

Template.chats.user_id = function() {
  return Meteor.userId()
}

Template.chats.messages = function() {
  if(Session.get('active')) {
    return Chats
      .find({class_id: Session.get('active')})
      .fetch()
      .map(function(chat){
        if(chat.user_id === Meteor.userId()) {
          chat.isMine = true;
        }
        return chat;
      })
      .sort(function(a, b){
        return ((new Date(a.created)).getTime() < (new Date(b.created)).getTime()) ? 1 : -1;
      })
  }
  return []
}

Template.class_layout.connected = function() {
  if(Session.get('active')) {
    return Attendees.find({class_id: Session.get('active')}).fetch()
  }
}

Template.chats.events({
  'keyup #chatinput' : function(e) {
    var target = $(e.target);
    var active = Session.get('active');
    if(e.keyCode === 13 && target.val().trim() && active) {

      Chats.insert({
        user_id: Meteor.userId(),
        class_id: active,
        gravatar: getUserAvatarUrl(),
        message: target.val(),
        created: (new Date())
      })

      console.log(target.val());
      target.val('');

    }
  }
});

Template.class_layout.events({
  'click #flagme': function() {
    var userId = Meteor.userId();
    var classId = Session.get('active');
    if(userId && classId) {
      var attendee = Attendees.findOne({
        user_id: userId,
        class_id: classId,
        image: {$not: ''}
      });
      console.log(attendee)
      if(attendee) {
        if(attendee.flagged) {
          Attendees.update({_id: attendee._id}, {$set: {
            flagged: false
          }})
        } else {
          Attendees.update({_id: attendee._id}, {$set: {
            flagged: true
          }})
        }
      }
    }
  },
  'click #deletepres': function() {
    bootbox.confirm('Are you sure you want to delete this presentation?', function(res){
      if(res) {
        var active = Session.get('active');

        Attendees.find({
          class_id: active
        }).fetch().forEach(function(attendee){
          Attendees.remove(attendee._id);
        });

        Chats.find({
          class_id: active
        }).fetch().forEach(function(chat){
          Chats.remove(chat._id);
        });

        Classes.remove(active);

        Session.set('active', null);

      }
    })
    // Session.set('active', null);
  }
})

Template.class_layout.isstudent = function() {
  return window.location.pathname.indexOf('student') > -1
}