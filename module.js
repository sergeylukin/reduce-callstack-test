import lodash from 'https://cdn.skypack.dev/lodash';
const _ = lodash;
window.calculateInsightsBoundariesInFgData = function (fgData = {}, start = 0, end = 0, insightsBoundaries = {}) {
    const reduceFgData = function (accumulator, entry) {
        const { value: duration, insight = null } = entry;
        accumulator.start = start;
        accumulator.end = start + duration;
        if (insight) {
            if (!accumulator.insightsBoundaries.hasOwnProperty(insight)) {
                accumulator.insightsBoundaries[insight] = {
                    start,
                    end,
                };
            } else {
                if (end > accumulator.insightsBoundaries[insight].end) {
                    accumulator.insightsBoundaries[insight].end = end;
                }
            }
        }
        if (entry.children) {
            const parseChildren = function (child, index) {
                const currentPosition = _.sumBy(_.slice(entry.children, 0, index), 'value');
                accumulator = {
                    ...window.calculateInsightsBoundariesInFgData(
                        child,
                        start + currentPosition,
                        start + currentPosition + child.value,
                        { ...accumulator.insightsBoundaries }
                    ),
                };
            };
            entry.children.forEach(parseChildren);
        }
        return accumulator;
    };
    const data = (Array.isArray(fgData) ? fgData : [fgData]).reduce(reduceFgData, {
        start,
        end,
        insightsBoundaries,
    });

    if (start > 0) return data;

    for (const key in data.insightsBoundaries) {
        const boundaries = data.insightsBoundaries[key];
        const offset = (boundaries.end - boundaries.start) / 5;
        const start = boundaries.start - offset;
        const end = boundaries.end + offset;
        data.insightsBoundaries[key].start = start > 0 ? start : boundaries.start;
        data.insightsBoundaries[key].end = end < data.end ? end : boundaries.end;
        console.trace('calculateInsightsBoundariesInFgData trace');
    }
    return data.insightsBoundaries;
};

window.dataSet = {
    children: [
        {
            children: [{ children: [], value: 5 }],
            value: 5,
        },
        {
            children: [
                { children: [], value: 2, insight: 'foo' },
                { children: [], value: 3, insight: 'foo' },
            ],
            value: 5,
            insight: 'foo',
        },
        {
            children: [
                { children: [], value: 1 },
                { children: [], value: 6 },
                { children: [], value: 3 },
            ],
            value: 10,
            insight: 'bar',
        },
        {
            children: [
                { children: [], value: 4 },
                { children: [], value: 4 },
                { children: [], value: 4 },
                { children: [], value: 4 },
            ],
            value: 16,
        },
        {
            children: [
                { children: [], value: 2, insight: 'bar' },
                { children: [], value: 8, insight: 'bar' },
                { children: [], value: 13, insight: 'bar' },
                { children: [], value: 6, insight: 'bar' },
                { children: [], value: 19, insight: 'bar' },
            ],
            value: 48,
            insight: 'bar',
        },
    ],
    value: 86,
};

window.expectedInsightsBoundaries = {
    foo: {
        start: 4,
        end: 11,
    },
    bar: {
        start: 10,
        end: 84,
    },
};

window.newValue;

// calculateInsightsBoundariesInFgData(dataSet);

export default window.calculateInsightsBoundariesInFgData;
