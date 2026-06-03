<!doctype html>
<html lang="en">
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
   
</head>
<body>
    <div>
        <canvas id="myChart"></canvas>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/chart.js">
        </script>

        <script>
            const ctx = document.getElementById('myChart');

            new chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Red','blue','Yellow','Green','Purple', 'Orange'],
                    datasets: [{
                        label: '#  of Votes',
                        data: [12, 19, 3 ,5, 2, 3],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtzero:  true
                        }
                    }
                }
            });
        </script>
    </div>
</body>
</html>