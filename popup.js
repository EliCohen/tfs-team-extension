$(function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'calculate'
    });
  });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.type) {
    case 'calculateFinish':
      setTimeout(() => setData(message.data, message.leftDays), 300);
      break;
    case 'calculateError':
      setError(message.error);
      break;
  }
});

function setData(data, leftDays) {
  let totalCommitmentsDays = 0;
  let donePbi = 0;
  let notDonePbi = 0;
  let commitmentsDaysLeft = 0;

  data.forEach((value) => {
    if (isPbi(value)) {
      totalCommitmentsDays += !['New', 'Approved'].includes(value.state)
        ? value.effort
        : 0;

      donePbi += value.state === 'Done' ? 1 : 0;
      notDonePbi += !['New', 'Approved', 'Done'].includes(value.state) ? 1 : 0;
      commitmentsDaysLeft += !['New', 'Approved', 'Done'].includes(value.state)
        ? value.effort
        : 0;
    }
  });

  $('#totalCommitmentsDays .totalValue').text(
    totalCommitmentsDays > 0 ? totalCommitmentsDays : 'None'
  );
  $('#donePbi .totalValue').text(donePbi > 0 ? donePbi : 'None');
  $('#notDonePbi .totalValue').text(notDonePbi > 0 ? notDonePbi : 'None');
  $('#commitmentsDaysLeft .totalValue').text(
    commitmentsDaysLeft > 0 ? commitmentsDaysLeft : 'None'
  );
  $('#teamDaysLeft .totalValue').text(leftDays > 0 ? leftDays : 'None');

  if (commitmentsDaysLeft > leftDays) {
    $('#commitmentsDaysLeft .totalValue').addClass('redValue');
  } else {
    $('#commitmentsDaysLeft .totalValue').addClass('greenValue');
  }

  removeLoading();
  $('.summary-container').removeClass('hidden');
}

function setError(error) {
  $('.error-container #error').text(error);
  removeLoading();
  $('.error-container').removeClass('hidden');
}

function isPbi(rowData) {
  return rowData.type === 'Product Backlog Item';
}

function removeLoading() {
  $('.loading-container').addClass('hidden');
}

function showLoading() {
  $('.loading-container').removeClass('hidden');
}
