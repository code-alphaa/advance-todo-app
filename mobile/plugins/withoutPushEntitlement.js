// The app only schedules local notifications, so it doesn't need the remote push
// entitlement that expo-notifications adds (unsupported by the team signing profile).
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
