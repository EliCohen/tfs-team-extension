// chrome.runtime.sendMessage({ todo: 'showPageAction' });
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.todo == 'changeColor') {
//   }
// });

// document.onload = function(event) {
//   console.log('Ready');
// };

(function() {
  const observerTargetElementSelector = '.content-section';
  const hubContentElementSelector = '.hub-content > div >.rightPane';
  const discountElementSelector = '.DiscountTag__DiscountText-sc-1nsisq8-1';
  const priceTagsClassName = '.PriceLabel__Root-tydi84-0>div';

  let sprintDays;
  let rowsData;

  const mutationsObserver = new MutationObserver((e) => {
    const hubContentElement = $(hubContentElementSelector);
    if (!$('#tfsTeamCalculateBtn')[0]) {
      let panelHeader = $('.backlogs-tool-panel-header', hubContentElement);
      if (panelHeader[0]) {
        panelHeader.append(
          `<span class="tfsTeamHeader">TFS Team Extension:</span>
        <button id="tfsTeamCalculateBtn">Calculate</button>`
        );

        $('#tfsTeamCalculateBtn').click(function(event) {
          calculateData();
        });
      }
    }

    // if (isThereADiscount() && !isPricesUpdated()) {
    //   let discount = getDiscount();
    //   if (typeof discount !== 'undefined') {
    //     chrome.runtime.sendMessage({
    //       type: '10bisDiscountShowIcon',
    //       discount: discount
    //     });
    //     updatePrices(discount);
    //   }
    // }
  });

  mutationsObserver.observe(
    document.querySelector(observerTargetElementSelector),
    {
      attributes: false,
      childList: true,
      subtree: true
    }
  );

  async function calculateData() {
    rowsData = new Map();
    const capacityPaneElement = $('.capacity-pane-container');
    const teamProgressElement = $(
      '.team-capacity-control .progress-text',
      capacityPaneElement
    );
    const teamProgressText = teamProgressElement.text();
    sprintDays = sprintDays
      ? sprintDays
      : Math.floor(
          parseInt(
            teamProgressText.slice(
              teamProgressText.indexOf(' of ') + 4,
              teamProgressText.indexOf(' h')
            )
          ) / 6
        );

    const totalCommitmentDays = await calculateTeamCommitment();

    updateTeamCommitment();

    const teamProgressCurrent = $(
      '.team-capacity-control .visual-progress-current',
      capacityPaneElement
    );

    teamProgressCurrent.width(
      `${Math.max(Math.ceil((totalCommitmentDays / sprintDays) * 100), 100)}%`
    );

    $('.team-capacity-control .display-text', capacityPaneElement).text(
      'Team Commitment'
    );

    teamProgressElement.text(`(${totalCommitmentDays} of ${sprintDays} Days)`);
  }

  async function calculateTeamCommitment() {
    let currentScroll = $('.productbacklog-grid-results .grid-canvas')[0]
      .scrollTop;
    scrollTo(0);
    await sleep(50);
    getRowsData();
    scrollToBottom();
    await sleep(50);
    getRowsData();
    scrollTo(currentScroll);

    let teamTotalCommitment = 0;
    rowsData.forEach((value, key) => {
      if (isPbi(value)) {
        teamTotalCommitment += !['New', 'Approved'].includes(value.state)
          ? value.effort
          : 0;
      }
    });

    return teamTotalCommitment;
  }

  function getRowsData() {
    const rowsElements = $(
      '.productbacklog-grid-results .grid-row.grid-row-normal'
    );

    const headerCellsTitles = $(
      '.productbacklog-grid-results .grid-header .grid-header-column .title'
    )
      .map(function() {
        return $.trim($(this).text());
      })
      .get();

    const orderIndex = headerCellsTitles.indexOf('Order');
    const titleIndex = headerCellsTitles.indexOf('Title');
    const stateIndex = headerCellsTitles.indexOf('State');
    const effortIndex = headerCellsTitles.indexOf('Effort');
    const assignedToIndex = headerCellsTitles.indexOf('Assigned To');

    rowsElements.get().forEach((row) => {
      const orderElement =
        orderIndex !== -1 ? $('.grid-cell', row)[orderIndex] : 0;
      const titleElement =
        titleIndex !== -1
          ? $('.work-item-type-icon', $('.grid-cell', row)[titleIndex])
          : undefined;
      const stateElement =
        stateIndex !== -1
          ? $('.workitem-state-value', $('.grid-cell', row)[stateIndex])
          : undefined;
      const effortElement =
        effortIndex !== -1 ? $('.grid-cell', row)[effortIndex] : 0;
      const assignedToElement =
        assignedToIndex !== -1
          ? $(
              '.identity-view-control span',
              $('.grid-cell', row)[assignedToIndex]
            )
          : undefined;

      const orderValue = orderElement ? orderElement.innerText : '0';
      if (!rowsData.has(orderValue))
        rowsData.set(orderValue, {
          type: titleElement ? titleElement.attr('aria-label') : '',
          state: stateElement ? stateElement.text() : '',
          effort:
            effortElement && isInt(effortElement.innerText)
              ? parseInt(effortElement.innerText)
              : 0,
          assignedTo: assignedToElement ? assignedToElement.text() : ''
        });
    });
  }

  function isInt(value) {
    return (
      !isNaN(value) &&
      parseInt(Number(value)) == value &&
      !isNaN(parseInt(value, 10))
    );
  }

  function isPbi(rowData) {
    return rowData.type === 'Product Backlog Item';
  }

  function updateTeamCommitment() {}

  function scrollTo(value) {
    let gridElement = $('.productbacklog-grid-results .grid-canvas')[0];
    gridElement.scrollTo(0, value);
  }

  function scrollToBottom() {
    let gridElement = $('.productbacklog-grid-results .grid-canvas')[0];
    scrollTo(gridElement.scrollHeight);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
