import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit {
  map = null;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.map = tt.map({
      key: 'b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V',
      container: 'map',
      style: 'tomtom://vector/1/basic-main',
      center: [73.778647, 18.6077501],
      zoom: 10,
    });
    this.map.addControl(new tt.NavigationControl());
    this.map.addControl(
      new tt.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
    this.loadImages();
    // this.getKitchenDetails();
    this.getSheetData().subscribe((resp) => {
      // console.log(resp);
      const features = [];
      const featuresPickup = [];
      const featuresFoodNeeded = [];
      resp.forEach((element) => {
        const props = {};
        Object.keys(element).forEach(function (key) {
          const value = element[key];
          props[key] = value;
        });
        /* let lat;
        let lon;
        if (element.foodrequiredlocationeglohegoanpune) {
          this.http.get('https://api.tomtom.com/search/2/geocode/' + element.foodrequiredlocationeglohegoanpune +
          '.json?key=b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V&limit=1').subscribe(response => {
            console.log(response);
            if (response.results.length >= 1) {
              lon = response.results[0].position.lon;
              lat =  response.results[0].position.lat;
            }
          });
        } */
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [element.longitude, element.latitude],
          },
          properties: props,
        };
        if (element.pickuplocationforgroceries) {
          featuresPickup.push(feature);
        } else if (element.foodrequiredlocationeglohegoanpune) {
          featuresFoodNeeded.push(feature);
        } else {
          features.push(feature);
        }
        // console.log(feature);
      });
      const featureCollectionForPickup = {
        type: 'FeatureCollection',
        features: featuresPickup,
      };
      const featureCollectionForFoodNeeded = {
        type: 'FeatureCollection',
        features: featuresFoodNeeded,
      };
      const featureCollection = {
        type: 'FeatureCollection',
        features: features,
      };
      const that = this;
      this.map.on('load', function () {
        that.plotLayer(that, 'kitchen', featureCollection);
        that.plotLayer(that, 'pickup', featureCollectionForPickup);
        that.plotLayer(that, 'foodneeded', featureCollectionForFoodNeeded);
      });
    });

    const popup = new tt.Popup();

    const that = this;
    // Change the cursor to a pointer when the mouse is over the places layer.
    this.map.on('mouseenter', 'kitchen', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
    this.map.on('click', 'kitchen', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });

    this.map.on('mouseenter', 'pickup', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
    this.map.on('click', 'pickup', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });

    this.map.on('mouseenter', 'foodneeded', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
    this.map.on('click', 'foodneeded', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
  }

  private plotLayer(that: this, layerName: string, featureCollection: { type: string; features: any[]; }) {
    that.map.addSource(layerName, {
      type: 'geojson',
      data: featureCollection,
    });
    let color;
    if (layerName === 'foodneeded') {
      color = '#FF0000';
    } else if (layerName === 'pickup') {
      color = '#00FF00';
    } else {
      color = '#0000FF';
    }
    that.map.addLayer({
      id: layerName,
      type: 'circle',
      source: layerName,
      paint: {
        'circle-radius': 10,
        'circle-color': color,
      }
      /* 'layout' : {
        'icon-image' : 'chef.svg',
        'icon-size' : 1
      } */
    });
  }

  private loadImages() {
    const speedCamImgArray = ['chef.png'];
    // tslint:disable-next-line: no-shadowed-variable
    const map = this.map;
    speedCamImgArray.forEach(function (speedCamImage) {
      map.loadImage('assets/' + speedCamImage, function (error, image) {
        if (error) {
          throw error;
        }
        map.addImage(speedCamImage, image);
      });
    });
  }
  private createPopup(e: any, popup: any, that: this) {

    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;
    let html = '<table style="border:fill">';
    Object.keys(properties).forEach(function (key) {
      const value = properties[key];
      html += '<tr><td>' + key + ': </td>' + '<td>' + value + '</td></tr>';
    });
    html += '</table>';

    popup.setLngLat(coordinates);
    popup.setHTML(html);
    popup.setMaxWidth('none');
    popup.addTo(that.map);

    // create DOM element for the marker
    /* const el = document.createElement('div');
    el.id = 'marker';
    // create the marker
    new tt.Marker(el)
    .setLngLat(coordinates)
    .setPopup(popup) // sets a popup on this marker
    .addTo(that.map); */
  }

  public getSheetData(): Observable<any> {
    const sheetId = '1JH7kZCHjG5fytRsne1NvF_T3uyK_Qa-jV3EJH3D5Fd0';
    const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;
    // const url =
      // 'https://spreadsheets.google.com/feeds/list/1dlbj_KA5847UGjqHxCwZ3uDGNYo2sirros7sBaBcttM/od6/public/values?alt=json';

    return this.http.get(url).pipe(
      map((res: any) => {
        const data = res.feed.entry;

        const returnArray: Array<any> = [];
        if (data && data.length > 0) {
          data.forEach((entry) => {
            const obj = {};
            for (const x in entry) {
              if (x.includes('gsx$') && entry[x].$t) {
                obj[x.split('$')[1]] = entry[x]['$t'];
              }
            }
            returnArray.push(obj);
          });
        }
        return returnArray;
      })
    );
  }
}
