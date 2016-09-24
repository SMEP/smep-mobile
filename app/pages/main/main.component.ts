import {Page} from "ui/page";
import {Component, OnInit, NgZone} from "@angular/core";
import * as app from "application";
var permissions = require("nativescript-permissions");

declare var android: any;
declare var zonedCallback : Function;

@Component({
    selector: "my-app",
    templateUrl: "pages/main/main.html",
    styleUrls: [ "pages/main/main-common.css" ]
})
export class MainPage implements OnInit {
    wifiList : Array<any> = [ {ssid : "Pressione para iniciar.."} ];

    private static LOCATION_PERMISSION = android.Manifest.permission.ACCESS_COARSE_LOCATION;

    constructor(private ngZone : NgZone) {}


    ngOnInit() {

       /* setInterval( () => {
            this.wifiList.push( { ssid : 'MyInterval' });
        }, 2500);*/
    }


    scanWifi() {
        this.wifiList = [ { ssid : 'Carregando...'}];

        let context = app.android.context;

        let wifiService = context.getSystemService( android.content.Context.WIFI_SERVICE );


        wifiService.startScan();


        // Can use zonedCallback or ngZone:
        app.android.registerBroadcastReceiver(
            android.net.wifi.WifiManager.SCAN_RESULTS_AVAILABLE_ACTION,
            zonedCallback(
                (context, intent) => {
                    let tp = wifiService.getScanResults();
                    console.log('scan results ok ' + tp.size());
                    this.wifiList = [];

                    for (let i = 0; i < tp.size(); i++) {
                        let ap = tp.get(i);
                        this.wifiList.push({ssid: ap.SSID});
                    }

                    console.dump(this.wifiList);
                }
            )
        );

        /*app.android.registerBroadcastReceiver(
            android.net.wifi.WifiManager.SCAN_RESULTS_AVAILABLE_ACTION,
            (context, intent) => {
                this.ngZone.run( () => {
                    let tp = wifiService.getScanResults();
                    console.log( 'scan results ok' + tp.size());
                    this.wifiList = [];

                    for( let i = 0; i < tp.size(); i++ ) {
                        let ap = tp.get(i);
                        this.wifiList.push( { ssid : ap.SSID } );
                    }

                    console.dump(this.wifiList);
                });
            });*/
    }


    listWifi() {
        let context = app.android.context;

        let wifiService = context.getSystemService( android.content.Context.WIFI_SERVICE );

        if( wifiService.isWifiEnabled() == false) {
            var Toast = android.widget.Toast;
            Toast.makeText( context, "Ligando WiFi...", Toast.LENGTH_SHORT).show();
            wifiService.setWifiEnabled(true);
        }

        if( !permissions.hasPermission( MainPage.LOCATION_PERMISSION ) ) {
            permissions.requestPermission( MainPage.LOCATION_PERMISSION, "Listar Wi-Fi Disponíveis" )
                .then( () => {
                    this.scanWifi();
                })
                .catch( () => alert('É necessária a permissão de localização.'));
        } else {
            this.scanWifi();
        }
    }

}