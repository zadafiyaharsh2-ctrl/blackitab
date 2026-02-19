const axios = require('axios');

const checkImageInContent = async () => {
    try {
        const topicId = '692209afa8de01f8d4dbe7f1';
        const response = await axios.get(`http://localhost:5000/api/topics/${topicId}/full`);

        if (response.data.success) {
            const content = response.data.data.content;
            console.log(`Total content blocks: ${content.length}\n`);

            // Find image blocks
            const imageBlocks = content.filter(block => block.type === 'image');
            console.log(`Image blocks found: ${imageBlocks.length}\n`);

            if (imageBlocks.length > 0) {
                console.log('Image details:');
                imageBlocks.forEach((img, idx) => {
                    console.log(`  Image ${idx + 1}:`);
                    console.log(`    src: ${img.src}`);
                    console.log(`    alt: ${img.alt}`);
                    console.log(`    caption: ${img.caption}`);
                });
                console.log('\n✓ Image successfully added to content!');
            } else {
                console.log('✗ No image blocks found in content');
            }
        } else {
            console.log('Failed to fetch content');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkImageInContent();
