<script>
/**
 * Lists every category of the result as a table, including the totals row.
 * Unlike the charts this is never reduced to a top-n selection.
 * @module addons/wfsAnalyzer/components/AnalysisTable
 */
export default {
    name: "AnalysisTable",
    props: {
        /** Categories as {label, value, share}. */
        categories: {
            type: Array,
            required: true
        },
        /** Sum of all category values. */
        total: {
            type: Number,
            required: true
        },
        /** Header of the value column. */
        valueHeader: {
            type: String,
            required: true
        },
        /** Formats a value for display. */
        formatValue: {
            type: Function,
            required: true
        }
    }
};
</script>

<template>
    <div class="table-responsive">
        <table class="table table-sm wfs-analyzer-table mb-0">
            <thead>
                <tr>
                    <th scope="col">
                        {{ $t("additional:modules.wfsAnalyzer.result.category") }}
                    </th>
                    <th
                        scope="col"
                        class="text-end"
                    >
                        {{ valueHeader }}
                    </th>
                    <th
                        scope="col"
                        class="text-end"
                    >
                        {{ $t("additional:modules.wfsAnalyzer.result.share") }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="category in categories"
                    :key="category.label"
                >
                    <td>{{ category.label }}</td>
                    <td class="text-end wfs-analyzer-number">
                        {{ formatValue(category.value) }}
                    </td>
                    <td class="text-end wfs-analyzer-number">
                        {{ (category.share * 100).toFixed(1) }}&nbsp;%
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr class="fw-bold">
                    <td>{{ $t("additional:modules.wfsAnalyzer.result.total") }}</td>
                    <td class="text-end wfs-analyzer-number">
                        {{ formatValue(total) }}
                    </td>
                    <td class="text-end wfs-analyzer-number">
                        100,0&nbsp;%
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<style lang="scss" scoped>
.wfs-analyzer-table {
    font-size: 12px;

    td, th {
        vertical-align: top;
    }
}

.wfs-analyzer-number {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
</style>
