import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ElementRef,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import * as d3 from 'd3';
import { ProductService } from 'src/app/product/product.service';
import { Observable } from 'rxjs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./statistics.component.scss', './statistics.component.css'],
})
export class StatisticsComponent implements OnInit {
  constructor(private productsService: ProductService) {}

  @ViewChild('chart')
  private chartContainer: ElementRef;

  data: any[] = [{ count: 15, date: '2020-05-30' }];
  showButton = false;
  private pdfData;

  ngOnInit(): void {
    this.productsService.getStatisticsData().subscribe((response) => {
      console.log(response);
      this.data = response.stats;
      this.createChart();
    });
    this.productsService.getPDFData().subscribe((response) => {
      console.log(JSON.parse(JSON.stringify(response)));
      this.pdfData = response.stats;
      this.showButton = true;
    });
  }

  margin = { top: 20, right: 20, bottom: 30, left: 40 };

  onResize($event) {
    this.createChart();
  }

  donwloadPDF() {
    var docDefinition = {
      content: [],
    };
    for (let stat of this.pdfData) {
      let data = {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 100, '*', 'auto'],

          body: [['Name', 'Quantity', 'Client', 'Location', 'Price']],
        },
      };
      let priceTotal = 0;
      for (let product of stat.products) {
        data.table.body.push([
          product.product,
          product.count,
          stat.client,
          stat.location,
          product.price,
        ]);
        priceTotal += product.count * product.price;
      }
      data.table.body.push(['', '', '', 'Total Price:', priceTotal.toString()]);
      docDefinition.content.push(data);
    }
    pdfMake.createPdf(docDefinition).download();
  }

  private createChart(): void {
    d3.select('svg').remove();

    const element = this.chartContainer.nativeElement;
    const data = this.data;

    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    const contentWidth =
      element.offsetWidth - this.margin.left - this.margin.right;
    const contentHeight =
      element.offsetHeight - this.margin.top - this.margin.bottom;

    const x = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.1)
      .domain(data.map((d) => d.date));

    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(data, (d) => d.count)]);

    const g = svg
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + contentHeight + ')')
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      // .call(d3.axisLeft(y).ticks(10, '%'))
      .call(d3.axisLeft(y).ticks(10))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.date))
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => contentHeight - y(d.count));
  }
}
