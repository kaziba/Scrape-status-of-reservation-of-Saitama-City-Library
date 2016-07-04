require('dotenv').config();

const fs = require('fs');

describe('さいたま市図書館', () => {

  // 非Angularのページの場合に必要
  browser.ignoreSynchronization = true;
  browser.get('https://www.lib.city.saitama.jp/login');

  it('ログイン', () => {
    const loginCardNumber = element(by.id('textUserId'));
    const loginPassword = element(by.id('textPassword'));
    const loginButton = element(by.id('buttonLogin4a'));

    loginCardNumber.sendKeys(process.env.CARD_NUMBER);
    loginPassword.sendKeys(process.env.PASSWORD);
    loginButton.click();
  });

  it('ログイン完了', () => {
    const headerMessage = element(by.id('honbuun'));
    const reservationListLink = element(by.linkText('予約状況照会へ'));

    expect(headerMessage.getText()).toEqual(`ログイン中です。利用者番号(${process.env.CARD_NUMBER}）`);
    expect(browser.getTitle()).toEqual(`ログイン中です。利用者番号(${process.env.CARD_NUMBER}） | さいたま市図書館`);

    reservationListLink.click();
  });

  it('予約状況参照', () => {
    const headerMessage = element(by.id('honbuun'));
    expect(headerMessage.getText()).toEqual(`予約状況の一覧です。利用者番号(${process.env.CARD_NUMBER}）`);

    $$('.infotable').map( info => {
      return info.getText()
    })
    .then( infoTextList => {

      return infoTextList
      .map( infoText => infoText.split('\n') )
      .map( info => {
        const data = info[1].split(' ');

        return {
          title: info[0],
          data: {
            reservationStatus: data[5],
            storagePeriod: data[7],
          }
        }
      })
      .filter( info => info.data.reservationStatus.match(/用意できています|受取待ち|搬送中/) );
    })
    .then( infoList => {

      console.log('\n受取待ち/搬送中の図書数: ', infoList.length);

      infoList.map(info => {
        console.log("\n" + info.title);
        console.log("予約状況: " + info.data.reservationStatus);
        console.log("お取り置き期限: " + info.data.storagePeriod);
      });
    });
  });

  it('貸出状況一覧へ', () => {
    browser.get('https://www.lib.city.saitama.jp/rentallist');
  });

  it('貸出状況照会', () => {
    const headerMessage = element(by.id('honbuun'));
    expect(headerMessage.getText()).toEqual(`貸出状況の一覧です。利用者番号(${process.env.CARD_NUMBER}）`);

    $$('.infotable').map( info => {
      return info.getText()
    })
    .then( infoTextList => {

      return infoTextList
      .map( infoText => infoText.split('\n') )
      .map( info => {
        const data = info[1].split(' ');

        // 延長可能の場合、延長可能かどうかの要素が空であるため要素数が少ない
        if(data.length < 8) {
          data.splice(4, 0, '延長可能');
        }

        return {
          title: info[0],
          data: {　
            checkoutDate: data[3],
            canExtend: data[5],
            returnPeriod: data[7],
          }
        }
      })
      // .filter( info => info.data.reservationStatus.match(/受取待ち|搬送中/) );
    })
    .then( infoList => {

      console.log('\n貸出中の図書数: ', infoList.length);

      infoList.map(info => {
        console.log("\n" + info.title);
        console.log("貸出日: " + info.data.checkoutDate);
        console.log("延長: " + info.data.canExtend);
        console.log("返却期限: " + info.data.returnPeriod);
      });
    });
  });
});