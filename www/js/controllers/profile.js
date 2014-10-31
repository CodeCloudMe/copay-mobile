'use strict'

angular.module('copay.controllers')

.controller('ProfileCtrl', function($scope, $window, Session, Config) {

  $scope.email = Session.identity.email;
  $scope.unit = Config.currency.btc;
  $scope.fiat = Config.currency.fiat;

  $scope.updateUnit = function(scope) {
    Config.currency.btc = scope.unit;
    Config.savePreferences();
  };

  $scope.updateFiat = function(scope) {
    Config.currency.fiat = scope.fiat;
    Config.savePreferences();
  };

  $scope.backup = function() {

    var identity = Session.identity;
    var file = identity.exportEncryptedWithWalletInfo(identity.password);
    var filename = identity.email + '-profile.json';

    $window.plugin.email.open({
      subject: 'Copay - Profile Backup',
      body: 'Here is your encrypted backup for the profile ' + identity.email,
      to: [identity.email],
      attachments: ['base64:' + filename + '//' + btoa(file)]
    });
  };

});
