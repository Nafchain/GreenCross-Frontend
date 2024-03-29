import { Component, OnInit } from '@angular/core';
import { ApiService } from "@shared/services/api.service";
import { Category } from "@shared/models/category";
import Chart, { ChartItem } from "chart.js/auto";
import { QuestionTypeEnum } from "@shared/enums/question-type.enum";
import { AppService } from "@shared/services/app.service";
import { filter, forkJoin, take } from "rxjs";
import { TestAnswers } from "@shared/models/test-answers";
import { Result } from "@shared/models/result";

interface ExtendedCategory extends Category {
  score: number;
}

@Component({
  selector: 'app-result-section',
  templateUrl: './result-section.component.html',
  styleUrls: ['./result-section.component.scss']
})
export class ResultSectionComponent implements OnInit {
  total = 0;
  score = 0;
  result?: Result;
  private categoriesScores: number[] = [];

  constructor(private apiService: ApiService, private appService: AppService) {
  }

  private static getScoreColor(score: number): string {
    if (score >= 100) {
      return '#22AF49';
    }
    if (score >= 60) {
      return '#A8BF19';
    }
    if (score >= 40) {
      return '#FFF500';
    }
    if (score >= 20) {
      return '#FF9D47';
    }
    return '#FF4740'
  }

  ngOnInit(): void {
    forkJoin([
      this.apiService.getTestData(),
      this.appService.answers$.pipe(filter(Boolean), take(1))
    ]).subscribe(([categories, answers]) => this.calculateResult(categories, answers))
  }

  // private calculateResult(categories: Category[], testAnswers: TestAnswers): void {
  //   const categoriesTotals = categories.map(category => category.questions.filter(question => question.questionType === QuestionTypeEnum.Agree).length * 5);
  //   this.total = categories.length * 50;
  //   const categoriesScores = testAnswers.answers
  //     .map((category, ci) =>
  //       Math.round(category.reduce((catAcc, answer, i) => {
  //         const question = categories![ci].questions[i];
  //         const score = answer.score || 0;
  //         catAcc += score ? Math.abs(score - (question.agree ? 0 : 6)) : 0;
  //         return catAcc;
  //       }, 0) * 50 / categoriesTotals[ci])
  //     );
  //   this.categoriesScores = categoriesScores;
  //   this.score = categoriesScores.reduce((acc, categoriesScore) => {
  //     acc += categoriesScore;
  //     return acc;
  //   }, 0);
  //   this.getResultObject();
  //   this.buildChart(categories.map((category, i) => ({ ...category, score: categoriesScores[i] })));
  // }

  private calculateResult(categories: Category[], testAnswers: TestAnswers): void {
    console.log("Calculating result");
    const categoriesTotals = categories.map(category =>
      category.questions.filter(question => question.questionType === QuestionTypeEnum.Agree).length * 5
    );
    this.total = categories.reduce((total, category) => total + category.questions.length * 500, 0);

    const categoriesScores = testAnswers.answers.map((category, ci) => {
      let categoryScore = 0;
      category.forEach((answer, i) => {
        const question = categories[ci].questions.find((_, index) => index === i);
        if (question) {
          const boolValue = answer.Bool === 1;
          categoryScore += boolValue ? 5 : 0; // Assuming each true value adds 5 to the score
        }
      });
      return Math.round((categoryScore) * 50);
    });

    this.categoriesScores = categoriesScores;

    this.score = categoriesScores.reduce((acc, categoryScore) => acc + categoryScore, 0);

    this.getResultObject();
    this.buildChart(categories.map((category, i) => ({ ...category, score: categoriesScores[i] })));
  }


  private buildChart(categories: ExtendedCategory[]): void {
    const ctx = document.getElementById('myChart') as ChartItem;
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: categories.map(x => x.title),
        datasets: [{
          data: categories.map(x => x.score/10),
          fill: true,
          backgroundColor: 'rgba(208, 215, 221, 0.5)',
          borderColor: 'rgb(208, 215, 221)',
          borderWidth: 2,
          pointRadius: 5,
          pointBorderWidth: 0,
          pointBackgroundColor: categories.map(x => ResultSectionComponent.getScoreColor(x.score)),
          pointHoverBackgroundColor: '#fff',
        }]
      },
      options: {
        elements: {
          line: {
            borderWidth: 3
          }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10,
              color: 'black',
              font: {
                size: 8
              },
            },
            grid: {
              color: 'black',
            },
            angleLines: {
              color: 'black',
            },
            pointLabels: {
              font: {
                size: 16,
                weight: 'bold'
              }
            }
          }
        }
      },
    });
  }

  private getResultObject() {
    this.apiService.getResults().subscribe(results => {
      const minResultCategoryIdx = this.categoriesScores.indexOf(Math.min(...this.categoriesScores));
      this.result = results[minResultCategoryIdx];
    })
  }
}
