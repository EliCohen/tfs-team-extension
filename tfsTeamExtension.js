chrome.runtime.sendMessage({ type: 'showPageAction' });
chrome.runtime.onMessage.addListener(async function(
  message,
  sender,
  sendResponse
) {
  if (message.type == 'calculate') {
    try {
      let result = await calculateData();

      chrome.runtime.sendMessage({
        type: 'calculateFinish',
        data: result.data,
        leftDays: result.leftDays
      });
    } catch (e) {
      chrome.runtime.sendMessage({
        type: 'calculateError',
        error: e.message
      });
    }
  }
});

async function calculateData() {
  const capacityPaneElement = $('.capacity-pane-container');
  const teamProgressElement = $(
    '.team-capacity-control .progress-text',
    capacityPaneElement
  );
  const teamProgressText = teamProgressElement.text();
  let sprintDays = Math.floor(
    parseInt(
      teamProgressText.slice(
        teamProgressText.indexOf(' of ') + 4,
        teamProgressText.indexOf(' h')
      )
    ) / 6
  );

  const rowsData = await calculateTeamCommitment();

  return {
    data: Array.from(rowsData.values()),
    leftDays: sprintDays
  };
}

async function calculateTeamCommitment() {
  let rowsData = new Map();
  let currentScroll = $('.productbacklog-grid-results .grid-canvas')[0]
    .scrollTop;
  scrollTo(0);
  await sleep(50);
  getRowsData(rowsData);
  scrollToBottom();
  await sleep(50);
  getRowsData(rowsData);
  scrollTo(currentScroll);

  return rowsData;
}

function getRowsData(rowsData) {
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

  validateMandatoryColumns(titleIndex, stateIndex, effortIndex);

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

function validateMandatoryColumns(titleIndex, stateIndex, effortIndex) {
  let missingColumns = [];

  if (titleIndex === -1) {
    missingColumns.push('Title');
  }
  if (stateIndex === -1) {
    missingColumns.push('State');
  }
  if (effortIndex === -1) {
    missingColumns.push('Effort');
  }

  if (missingColumns.length > 0) {
    let missingMessage =
      missingColumns.length === 1
        ? ' column is missing! Please add it and try again.'
        : ' columns are missing! Please add them and try again.';
    throw new Error(missingColumns.join(', ') + missingMessage);
  }
}

function isInt(value) {
  return (
    !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10))
  );
}

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
