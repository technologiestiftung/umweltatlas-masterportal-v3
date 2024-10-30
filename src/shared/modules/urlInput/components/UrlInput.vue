<script>
export default {
    name: "UrlInput",
    props: {
        layerUrl: {
            type: String,
            required: true
        }
    },
    methods: {
        copyToClipboard(text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        console.log('Text copied to clipboard');
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
            } else {
                // Fallback method for browsers that don't support navigator.clipboard
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    console.log('Text copied to clipboard (fallback)');
                } catch (err) {
                    console.error('Failed to copy text (fallback): ', err);
                }
                document.body.removeChild(textArea);
            }
        }
    }
};
</script>

<template>
    <div class="ua-url-input">
        <input
            type="text"
            :value="layerUrl"
            readonly
        />
        <div class="input-btns">
            <button
                class="btn copy-btn input-btn"
                @click="copyToClipboard(layerUrl)"
                title="Adresse kopieren"
            >
                <i class="bi-copy"></i>
            </button>
            <a
                target="_blank"
                class="input-btn"
                :href="layerUrl"
                title="Adresse öffnen"
            >
                <i class="bi-box-arrow-up-right"></i>
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

    .ua-url-input {
        position: relative;
        margin-bottom: 5px;
        font-size: 14px;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;

        input{
            width: calc(100% - 50px);
            border: none;
            text-overflow: ellipsis;
            border-radius: 0.375rem;
            padding: 0.375rem 0.75rem
        }

        input:active {
            border-color: $link-color;
        }

        input:focus {
            outline: none; /* Removes the default focus outline */
            border-color: $link-color;
        }

        .input-btns {
            border: none;
            position: absolute;
            right: 5px;
            top: 1px;
            padding-left: 5px;
        }

        .input-btn {
            color: #676767;
            border: none;
            cursor: pointer;
            padding: 2px;
            box-shadow: none;

            i{
                padding: 0px 2px;
                font-size: 16px;
            }
        }

        .input-btn:hover {
            color: $link-color;
        }
    }

</style>
