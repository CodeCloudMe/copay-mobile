'use strict'

angular.module('copay.controllers')

.controller('SendCtrl', function($scope, $filter, $state, $ionicLoading, Proposals, Config, Rates) {
  $scope.proposals = Proposals.filter($scope.wallet, {status: Proposals.STATUS.pending});
  $scope.needsApproval = $scope.wallet.requiresMultipleSignatures();

  $scope.unitCode = Config.currency.fiat;
  $scope.altCode = Config.currency.btc;
  $scope.unitFiat = true;

  var displayBtc = $filter('displayBtc');
  var displayFiat = $filter('displayFiat');

  $scope.toggleUnit = function(value) {
    var currency = Config.currency;

    $scope.unitFiat = !$scope.unitFiat;
    $scope.unitCode = $scope.unitFiat ? currency.fiat : currency.btc;
    $scope.altCode = !$scope.unitFiat ? currency.fiat : currency.btc;

    $scope.convert(value);
  };

  $scope.convert = function(value) {
    if (!value) return $scope.altAmount = null;

    if ($scope.unitFiat) {
      var sats = Rates.fromFiat(value, $scope.unitCode);
      $scope.altAmount = displayBtc(sats);
    } else {
      var sats = Rates.toSatoshis(value, $scope.unitCode);
      $scope.altAmount = displayFiat(sats);
    }
  };

  $scope.clearForm = function(form) {
    form.address = form.amount = $scope.altAmount = form.reference = "";
    form.$setPristine();
  }

  $scope.submit = function(form) {
    if (!form.$valid) return;

    var wallet = $scope.wallet;
    var message = $scope.needsApproval ? 'Creating proposal' : 'Sending';
    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> ' + message + '...'
    });

    var satoshis = Rates.toSatoshis(form.amount, $scope.unitCode);
    wallet.createTx(form.address, satoshis, form.reference, onCreate);

    function onCreate(err, proposalId) {
      if (err) throw err; // TODO: Handle this!

      if ($scope.needsApproval) {
        $ionicLoading.hide();
        // TODO: Toast Notification
        $state.go('profile.wallet.proposal', {proposalId: proposalId});
      } else {
        wallet.sendTx(ntxid, onSend);
      }
    }

    function onSend(txid) {
      if (!txid) throw 'Problem Sending!'; // TODO: Handle this!
      $ionicLoading.hide();
      // TODO: Toast Notification
      $scope.clearForm(form);
    }
  }

})

.controller('ProposalCtrl', function($scope, $state, $ionicLoading, $stateParams, Proposals) {
  $scope.proposal = Proposals.get($scope.wallet, $stateParams.proposalId);

  $scope.sign = function() {
    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> Signing...'
    });

    Proposals.sign($scope.wallet, $stateParams.proposalId, function onResult(err) {
      $ionicLoading.hide();
      if (err) throw err; // TODO: Handle this error!
      // TODO: Notification it's done!
      $state.reload();
    });
  };

  $scope.reject = function() {
    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> Rejecting...'
    });

    Proposals.reject($scope.wallet, $stateParams.proposalId, function onResult(err) {
      $ionicLoading.hide();
      if (err) throw err; // TODO: Handle this error!
      // TODO: Notification it's done!
      $state.reload();
    });
  };

});
