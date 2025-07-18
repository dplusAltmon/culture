// 莫兰迪配色方案
const morandiColors = {
    blue: "#9CAFB7",
    green: "#A5B498",
    yellow: "#D4C5B1",
    red: "#C9A9A6",
    purple: "#A99CAC",
    gray: "#B8B0A9",
    lightGray: "#E4E1DD",
    darkGray: "#5d5a56"
};

// 初始化产业概览
function initIndustryOverview() {
    // 产业概览主容器
    const container = document.getElementById("industry-overview");
    const width = container.clientWidth;
    const height = 600;
    
    // 创建SVG
    const svg = d3.select("#industry-overview")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "overview-container");
    
    // 加载数据
    d3.json("data/overview-data.json").then(data => {
        // 绘制标题
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("fill", morandiColors.darkGray)
            .text("2024年全国文化及相关产业发展概况");
        
        // 计算布局位置
        const gaugeWidth = width * 0.3;
        const donutWidth = width * 0.3;
        const barWidth = width * 0.6;
        
        // 总营收仪表盘
        const revenueGauge = svg.append("g")
            .attr("transform", `translate(${gaugeWidth/2 + 50}, 200)`);
        
        drawGauge(revenueGauge, gaugeWidth, data.totalRevenue, 
                 data.revenueGrowth, "总营收(万亿元)", morandiColors.blue);
        
        // GDP占比环形图
        const gdpRatioChart = svg.append("g")
            .attr("transform", `translate(${gaugeWidth + donutWidth/2 + 50}, 200)`);
        
        drawDonutChart(gdpRatioChart, donutWidth, [
            {name: "文化产业", value: data.gdpRatio},
            {name: "其他产业", value: 100 - data.gdpRatio}
        ], "文化产业占GDP比重");
        
        // 就业人数柱状图
        const employmentChart = svg.append("g")
            .attr("transform", `translate(${width/2 - barWidth/2}, 450)`);
        
        drawBarChart(employmentChart, barWidth, 150, [
            {year: "2023", value: data.employment2023},
            {year: "2024", value: data.employment2024}
        ], "就业人数(万人)", morandiColors.green);
        
        // 固定资产投资指标卡
        drawMetricCard(svg, 
                      width - 200, 100, 
                      "固定资产投资", 
                      `${data.fixedAssetInvestment}亿元`, 
                      `${data.fixedAssetGrowth}%`,
                      morandiColors.purple);
    });
}

// 仪表盘绘制函数
function drawGauge(container, width, value, growth, label, color) {
    const height = 180;
    const radius = Math.min(width, height) * 0.4;
    const centerX = 0;
    const centerY = radius + 20;
    
    // 创建渐变背景
    const defs = container.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "gaugeGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.7);
    
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 1);
    
    // 绘制仪表盘背景
    container.append("path")
        .attr("d", d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius)
            .startAngle(-Math.PI * 0.7)
            .endAngle(Math.PI * 0.7)
        )
        .attr("fill", morandiColors.lightGray)
        .attr("transform", `translate(${centerX}, ${centerY})`);
    
    // 计算当前值对应的角度
    const maxValue = 10; // 最大值10万亿元
    const angleRange = Math.PI * 1.4; // 总角度范围
    const angle = -Math.PI * 0.7 + (value / maxValue) * angleRange;
    
    // 绘制仪表盘指针
    container.append("path")
        .attr("d", d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius)
            .startAngle(-Math.PI * 0.7)
            .endAngle(angle)
        )
        .attr("fill", "url(#gaugeGradient)")
        .attr("transform", `translate(${centerX}, ${centerY})`);
    
    // 绘制指针
    container.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", 
            centerX + Math.sin(angle) * radius * 0.7)
        .attr("y2", 
            centerY - Math.cos(angle) * radius * 0.7)
        .attr("stroke", "#555")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round");
    
    // 绘制中心圆
    container.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", 8)
        .attr("fill", "#555");
    
    // 显示数值
    container.append("text")
        .attr("x", centerX)
        .attr("y", centerY + radius + 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", color)
        .text(value.toFixed(1));
    
    // 显示标签
    container.append("text")
        .attr("x", centerX)
        .attr("y", centerY + radius + 55)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", morandiColors.darkGray)
        .text(label);
    
    // 显示增长率
    const growthColor = growth >= 0 ? morandiColors.green : morandiColors.red;
    container.append("text")
        .attr("x", centerX)
        .attr("y", centerY + radius + 80)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", growthColor)
        .text(`${growth >= 0 ? '+' : ''}${growth}% 同比增长`);
}

// 环形图绘制函数
function drawDonutChart(container, width, data, title) {
    const radius = Math.min(width, 300) * 0.4;
    const innerRadius = radius * 0.6;
    
    // 创建饼图布局
    const pie = d3.pie()
        .value(d => d.value);
    
    // 创建弧生成器
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);
    
    // 创建标签弧
    const labelArc = d3.arc()
        .innerRadius(radius + 10)
        .outerRadius(radius + 30);
    
    // 绘制扇形
    const arcs = container.selectAll("g")
        .data(pie(data))
        .enter()
        .append("g");
    
    // 扇形填充莫兰迪色系
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => {
            const colors = [morandiColors.green, morandiColors.lightGray];
            return colors[i % colors.length];
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("transition", "opacity 0.3s")
        .on("mouseover", function() {
            d3.select(this).style("opacity", 0.7);
        })
        .on("mouseout", function() {
            d3.select(this).style("opacity", 1);
        });
    
    // 添加标签
    arcs.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", morandiColors.darkGray)
        .text(d => `${d.data.name}: ${d.data.value}%`);
    
    // 添加中心文本
    container.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", morandiColors.darkGray)
        .text(`${data[0].value}%`);
    
    container.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("y", 25)
        .attr("font-size", "14px")
        .attr("fill", morandiColors.darkGray)
        .text("占GDP比重");
    
    // 添加标题
    container.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -radius - 20)
        .attr("font-size", "16px")
        .attr("fill", morandiColors.darkGray)
        .text(title);
}

// 柱状图绘制函数
function drawBarChart(container, width, height, data, label, color) {
    const margin = {top: 10, right: 10, bottom: 40, left: 40};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // 移动到带边距的位置
    container.attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // 创建X轴比例尺
    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, chartWidth])
        .padding(0.4);
    
    // 创建Y轴比例尺
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.1])
        .range([chartHeight, 0]);
    
    // 绘制X轴
    container.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("font-size", "14px")
        .attr("fill", morandiColors.darkGray);
    
    // 添加X轴标签
    container.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + margin.bottom})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", morandiColors.darkGray)
        .text("年份");
    
    // 绘制Y轴
    container.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("fill", morandiColors.darkGray);
    
    // 添加Y轴网格线
    container.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickSize(-chartWidth)
            .tickFormat("")
        );
    
    // 绘制柱状图
    const bars = container.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => chartHeight - y(d.value))
        .attr("fill", color)
        .style("transition", "all 0.3s ease")
        .on("mouseover", function() {
            d3.select(this)
                .attr("fill", d3.color(color).darker(0.3))
                .attr("stroke", "#333")
                .attr("stroke-width", 1);
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("fill", color)
                .attr("stroke", "none");
        });
    
    // 添加数据标签
    container.selectAll("text.value")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "value")
        .attr("x", d => x(d.year) + x.bandwidth()/2)
        .attr("y", d => y(d.value) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", morandiColors.darkGray)
        .text(d => d.value);
    
    // 添加标题
    container.append("text")
        .attr("x", chartWidth/2)
        .attr("y", -margin.top)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", morandiColors.darkGray)
        .text(label);
    
    // 计算增长率并显示
    const growth = ((data[1].value - data[0].value) / data[0].value * 100).toFixed(1);
    const growthColor = growth >= 0 ? morandiColors.green : morandiColors.red;
    
    container.append("text")
        .attr("x", chartWidth/2)
        .attr("y", chartHeight + margin.bottom + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", growthColor)
        .text(`同比增长 ${growth >= 0 ? '+' : ''}${growth}%`);
}

// 指标卡绘制函数
function drawMetricCard(container, x, y, title, value, growth, color) {
    const cardWidth = 180;
    const cardHeight = 120;
    
    // 绘制卡片背景
    container.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", cardWidth)
        .attr("height", cardHeight)
        .attr("rx", 8)
        .attr("fill", "white")
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.1))");
    
    // 标题
    container.append("text")
        .attr("x", x + cardWidth/2)
        .attr("y", y + 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", morandiColors.darkGray)
        .text(title);
    
    // 数值
    container.append("text")
        .attr("x", x + cardWidth/2)
        .attr("y", y + 70)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", color)
        .text(value);
    
    // 增长率
    const growthColor = growth >= 0 ? morandiColors.green : morandiColors.red;
    container.append("text")
        .attr("x", x + cardWidth/2)
        .attr("y", y + 95)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", growthColor)
        .text(`同比 ${growth >= 0 ? '+' : ''}${growth}`);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initIndustryOverview);
