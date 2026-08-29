/**
 * Application entry point — mounts the app shell and routes between screens.
 *
 * Screens are swapped below the header, which is re-rendered per screen so a
 * view can add its own return path. When real routing arrives, `navigate` is
 * the single seam to replace.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;
  var headerSlot = el('div', { className: 'app-shell__header' });
  var viewport = el('div', { className: 'app-shell__view' });

  // The packet under construction, so a screen can be revisited with its state.
  var current = { packet: null };

  // Full packets built this session, keyed by packetId, so reopening one
  // from the list reuses what was actually configured rather than the
  // generic figures a seed row falls back to.
  var createdPackets = {};

  /** Adds a packet built through the New Analyzer Packet flow to the list,
      once -- revisiting Analyzer Packet for the same packet must not add a
      second row. */
  function registerPacket(packet) {
    createdPackets[packet.packetId] = packet;
    var exists = DA.data.analyzerPackets.some(function (row) {
      return row.packetId === packet.packetId;
    });
    if (!exists) {
      DA.data.analyzerPackets.unshift(DA.data.summarizePacket(packet, DA.session.currentUser));
    }
  }

  /** The full packet behind a list row: one built this session if there is
      one (keeping whatever the user actually configured), otherwise a
      stand-in reconstructed from the row itself. */
  function resolveFullPacket(row) {
    return createdPackets[row.packetId] || DA.data.packetFromRow(row, DA.session.currentUser);
  }

  var views = {
    packets: {
      render: function () {
        return DA.pages.AnalyzerPacketsPage({
          rows: DA.data.analyzerPackets,
          currentUser: DA.session.currentUser,
          onNewPacket: function () { navigate('customer-details'); },
          onOpenPacket: function (row) {
            current.packet = resolveFullPacket(row);
            navigate('analyzer-packet');
          }
        });
      }
    },

    'customer-details': {
      render: function () {
        return DA.pages.CustomerDetailsPage({
          onBack: function () { navigate('packets'); },
          onSourceData: function (input) {
            current.packet = DA.data.buildPacket(input, DA.session.currentUser);
            navigate('create-scenarios', { showSourcingDialog: true });
          }
        });
      }
    },

    'create-scenarios': {
      render: function (params) {
        return DA.pages.CreateScenariosPage({
          packet: current.packet,
          showSourcingDialog: params.showSourcingDialog,
          onBack: function () { navigate('customer-details'); },
          onOpenAccounts: function (bid, scenario) {
            navigate('account-association', { bid: bid, scenario: scenario });
          },
          onProceed: function () {
            registerPacket(current.packet);
            navigate('analyzer-packet');
          }
        });
      }
    },

    'analyzer-packet': {
      header: function () {
        return { backLink: { label: 'Back to My Analyzers', onClick: function () { navigate('packets'); } } };
      },
      render: function () {
        return DA.pages.AnalyzerPacketPage({
          packet: current.packet,
          onBack: function () { navigate('create-scenarios'); },
          onExit: function () { navigate('packets'); }
        });
      }
    },

    'account-association': {
      header: function () {
        return { backLink: { label: 'Back to My Analyzers', onClick: function () { navigate('packets'); } } };
      },
      render: function (params) {
        return DA.pages.AccountAssociationPage({
          bid: params.bid,
          scenario: params.scenario,
          packet: current.packet,
          onBack: function () { navigate('create-scenarios'); }
        });
      }
    }
  };

  function navigate(name, params) {
    var view = views[name] || views.packets;
    var header = view.header ? view.header() : {};

    DA.dom.clear(headerSlot).appendChild(
      DA.components.AppHeader({
        productName: 'Digital Analyzer',
        user: DA.session.currentUser,
        backLink: header.backLink
      })
    );

    DA.dom.clear(viewport).appendChild(view.render(params || {}));
    viewport.scrollTop = 0;
    var page = viewport.querySelector('.page');
    if (page) page.scrollTop = 0;
  }

  function mount() {
    var root = document.getElementById('app');
    if (!root) return;

    DA.dom.clear(root).appendChild(
      el('div', { className: 'app-shell' }, [headerSlot, viewport])
    );
    navigate('packets');
  }

  DA.app = { navigate: navigate };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})(window.DA);
