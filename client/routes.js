Router.configure({
  layoutTemplate: 'layout'
});

Deps.autorun(function(){

  var active = Session.get('active');
  var pres = Classes.findOne(active);

  if(pres) {
    if(window.location.pathname.indexOf('teacher') === -1 && typeof imp !== 'undefined' ) {
      imp.toStep(pres.active);
    }
  }

});

Router.map(function() {
  this.route('home', {
    path: '/',
    template: 'home',
    onBeforeAction: function (pause) {
      var active = Session.get('active');
      if(active) {
        var attends = Attendees.find({
          class_id: active,
          user_id: Meteor.userId()
        });
        if(attends) {
          attends.forEach(function(attend){
            Attendees.remove(attend._id);
          });
        }
        Session.set('active', null);
      }
    }
  });

  this.route('getpath', {
    path: '/getpath/:_id',
    action: function() {
      if(Meteor.user()) {
        var cls = Classes.findOne(this.params._id);
        if(cls && cls.owner === Meteor.userId()) {
          return this.redirect('/teacher/' + this.params._id);
        }
        return this.redirect('/student/' + this.params._id);
      }
      return this.redirect('/');
    }
  })

  this.route('teacher', {
    path: 'teacher/:_id',
    layoutTemplate: 'class_layout',
    data: function() {
      return Classes.findOne(this.params._id);
    },
    onBeforeAction: function() {
      var data = this.data();
      if(data) {
        Session.set('active', data._id);
      }
    },
    onAfterAction: function() {
      var data = this.data();
      if(data) {
        var attend = Attendees.findOne({
          class_id: data._id,
          user_id: Meteor.userId()
        });
        if(!attend) {
          Attendees.insert({
            class_id: data._id,
            user_id: Meteor.userId(),
            image: getUserAvatarUrl(),
            flagged: false
          });
        }
      }
    },
    template: 'teachertemplate'
  });

  this.route('student', {
    path: 'student/:_id',
    layoutTemplate: 'class_layout',
    data: function() {
      return Classes.findOne(this.params._id);
    },
    onAfterAction: function() {
      var data = this.data();
      if(data) {
        Session.set('active', data._id);
        var attend = Attendees.findOne({
          class_id: data._id,
          user_id: Meteor.userId()
        });
        if(!attend) {
          Attendees.insert({
            class_id: data._id,
            user_id: Meteor.userId(),
            image: getUserAvatarUrl(),
            flagged: false
          });
        }
      }
    },
    template: 'studenttemplate'
  });
});

